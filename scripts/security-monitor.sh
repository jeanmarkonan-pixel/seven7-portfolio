#!/bin/bash
# =============================================================================
# 📡 SURVEILLANCE TEMPS RÉEL - SEVEN7 SECURITY MONITOR v1.0
# Surveille les tentatives d'intrusion et envoie des alertes
# =============================================================================
# Usage: ./security-monitor.sh [options]
# --slack-webhook URL Webhook Slack pour alertes
# --discord-webhook URL Webhook Discord pour alertes
# --interval SECONDS Intervalle de scan (défaut: 60)
# =============================================================================

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

SLACK_WEBHOOK=""
DISCORD_WEBHOOK=""
INTERVAL=60
LOG_FILE="security-monitor.log"
ALERT_COOLDOWN=300 # 5 minutes entre alertes similaires

# Projets à surveiller
DOMAINS=(
    "https://p-tit-comptable-a7d67.web.app"
    "https://seven7-audit.web.app"
    "https://ma-gestion-ci.web.app"
    "https://seven7-portfolio-site.vercel.app"
)

# Seuils d'alerte
THRESHOLD_STATUS_ERROR=3
THRESHOLD_RESPONSE_TIME=5000
THRESHOLD_HONEYPOT=1

# État
LAST_ALERTS=()

# Couleurs
R='\033[0;31m'
G='\033[0;32m'
Y='\033[1;33m'
B='\033[0;34m'
C='\033[0;36m'
BD='\033[1m'
NC='\033[0m'

# ============================================================================
# UTILITAIRES
# ============================================================================

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "$msg"
    echo "$msg" >> "$LOG_FILE"
}

alert() {
    local level="$1"
    local message="$2"
    local domain="${3:-}"

    log "${level}: $message ${domain}"

    # Vérifier cooldown
    local alert_key="${level}_${message}_${domain}"
    local now=$(date +%s)

    for i in "${!LAST_ALERTS[@]}"; do
        local entry="${LAST_ALERTS[$i]}"
        local key="${entry%%|*}"
        local timestamp="${entry##*|}"

        if [ "$key" == "$alert_key" ]; then
            if (( now - timestamp < ALERT_COOLDOWN )); then
                log " → Alert en cooldown (ignorée)"
                return
            else
                unset 'LAST_ALERTS[$i]'
            fi
        fi
    done

    LAST_ALERTS+=("${alert_key}|${now}")

    send_slack_alert "$level" "$message" "$domain"
    send_discord_alert "$level" "$message" "$domain"
}

send_slack_alert() {
    [ -z "$SLACK_WEBHOOK" ] && return

    local level="$1"
    local message="$2"
    local domain="${3:-}"
    local color="warning"

    case "$level" in
        CRITICAL) color="danger" ;;
        WARNING) color="warning" ;;
        INFO) color="good" ;;
    esac

    local payload
    payload=$(cat <<EOF
{
    "attachments": [{
        "color": "$color",
        "title": "🚨 SEVEN7 Security Alert - $level",
        "text": "$message",
        "fields": [
            {"title": "Domaine", "value": "$domain", "short": true},
            {"title": "Heure", "value": "$(date '+%H:%M:%S')", "short": true}
        ],
        "footer": "SEVEN7 Security Monitor",
        "ts": $(date +%s)
    }]
}
EOF
)

    curl -s -X POST -H 'Content-type: application/json' \
        --data "$payload" "$SLACK_WEBHOOK" > /dev/null 2>&1 || true
}

send_discord_alert() {
    [ -z "$DISCORD_WEBHOOK" ] && return

    local level="$1"
    local message="$2"
    local domain="${3:-}"
    local color=16776960

    case "$level" in
        CRITICAL) color=15158332 ;;
        WARNING) color=16776960 ;;
        INFO) color=3066993 ;;
    esac

    local payload
    payload=$(cat <<EOF
{
    "embeds": [{
        "title": "🚨 SEVEN7 Security Alert",
        "description": "$message",
        "color": $color,
        "fields": [
            {"name": "Niveau", "value": "$level", "inline": true},
            {"name": "Domaine", "value": "$domain", "inline": true},
            {"name": "Heure", "value": "$(date '+%H:%M:%S')", "inline": true}
        ],
        "footer": {"text": "SEVEN7 Security Monitor"}
    }]
}
EOF
)

    curl -s -X POST -H 'Content-type: application/json' \
        --data "$payload" "$DISCORD_WEBHOOK" > /dev/null 2>&1 || true
}

# ============================================================================
# TESTS DE SÉCURITÉ
# ============================================================================

check_availability() {
    local domain="$1"
    local start_time=$(date +%s%N)

    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$domain" 2>/dev/null || echo "000")

    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))

    echo "$status|$response_time"
}

check_honeypots() {
    local domain="$1"
    local honeypots=("/admin" "/wp-admin" "/.env" "/config.json" "/api/internal" "/debug")
    local triggered=0

    for endpoint in "${honeypots[@]}"; do
        local status
        status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${domain}${endpoint}" 2>/dev/null || echo "000")

        if [ "$status" != "404" ] && [ "$status" != "403" ]; then
            ((triggered++))
            alert "WARNING" "Honeypot touché: ${endpoint} → $status" "$domain"
        fi
    done

    return $triggered
}

check_headers() {
    local domain="$1"
    local response
    response=$(curl -sI --max-time 10 "$domain" 2>/dev/null || echo "")

    if [ -z "$response" ]; then
        alert "CRITICAL" "Site inaccessible (timeout)" "$domain"
        return 1
    fi

    local missing_headers=()

    if ! echo "$response" | grep -qi "X-Frame-Options"; then
        missing_headers+=("X-Frame-Options")
    fi

    if ! echo "$response" | grep -qi "Content-Security-Policy"; then
        missing_headers+=("CSP")
    fi

    if ! echo "$response" | grep -qi "Strict-Transport-Security"; then
        missing_headers+=("HSTS")
    fi

    if [ ${#missing_headers[@]} -gt 0 ]; then
        alert "WARNING" "Headers manquants: ${missing_headers[*]}" "$domain"
    fi

    return 0
}

check_firebase_config() {
    local domain="$1"
    local page
    page=$(curl -s --max-time 10 "$domain" 2>/dev/null || echo "")

    if [ -z "$page" ]; then
        return 1
    fi

    if echo "$page" | grep -q "apiKey.*AIza"; then
        alert "CRITICAL" "Firebase apiKey exposée dans le HTML!" "$domain"
    fi

    if echo "$page" | grep -q "authDomain.*firebaseapp.com"; then
        alert "CRITICAL" "Firebase authDomain exposée!" "$domain"
    fi

    return 0
}

check_ssl() {
    local domain="$1"
    local host="${domain/https:\/\/}"
    host="${host/http:\/\/}"

    local expiry
    expiry=$(echo | openssl s_client -servername "$host" -connect "$host:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)

    if [ -n "$expiry" ]; then
        local expiry_epoch
        expiry_epoch=$(date -d "$expiry" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$expiry" +%s 2>/dev/null)
        local now=$(date +%s)
        local days_left=$(( (expiry_epoch - now) / 86400 ))

        if [ "$days_left" -lt 7 ]; then
            alert "CRITICAL" "Certificat SSL expire dans $days_left jours!" "$domain"
        elif [ "$days_left" -lt 30 ]; then
            alert "WARNING" "Certificat SSL expire dans $days_left jours" "$domain"
        fi
    fi

    return 0
}

# ============================================================================
# BOUCLE PRINCIPALE
# ============================================================================

scan_all() {
    log "═══════════════════════════════════════════════════════════════"
    log "🔍 Scan de sécurité - $(date '+%Y-%m-%d %H:%M:%S')"
    log "═══════════════════════════════════════════════════════════════"

    local total_errors=0
    local total_warnings=0

    for domain in "${DOMAINS[@]}"; do
        log ""
        log "📡 $domain"

        # 1. Disponibilité
        local result
        result=$(check_availability "$domain")
        local status="${result%%|*}"
        local response_time="${result##*|}"

        log " Status: $status | Temps: ${response_time}ms"

        if [ "$status" != "200" ] && [ "$status" != "301" ] && [ "$status" != "308" ]; then
            alert "CRITICAL" "HTTP $status" "$domain"
            ((total_errors++))
            continue
        fi

        if [ "$response_time" -gt "$THRESHOLD_RESPONSE_TIME" ]; then
            alert "WARNING" "Temps de réponse lent: ${response_time}ms" "$domain"
            ((total_warnings++))
        fi

        # 2. Headers
        if ! check_headers "$domain"; then
            ((total_errors++))
        fi

        # 3. Honeypots
        if check_honeypots "$domain"; then
            ((total_warnings += $?))
        fi

        # 4. Firebase config
        if ! check_firebase_config "$domain"; then
            ((total_errors++))
        fi

        # 5. SSL
        if [[ "$domain" == https* ]]; then
            check_ssl "$domain"
        fi

        # 6. Test XSS basique
        local xss_test
        xss_test=$(curl -s --max-time 5 "${domain}/?q=<script>test</script>" 2>/dev/null | grep -c "<script>test</script>" || echo "0")
        if [ "$xss_test" -gt 0 ]; then
            alert "CRITICAL" "XSS réfléchi possible!" "$domain"
            ((total_errors++))
        fi
    done

    log ""
    log "📊 Résumé: $total_errors erreurs, $total_warnings warnings"

    if [ "$total_errors" -eq 0 ] && [ "$total_warnings" -eq 0 ]; then
        log "✅ Tous les systèmes sont sécurisés"
    fi

    log ""
}

# ============================================================================
# INTERFACE UTILISATEUR
# ============================================================================

banner() {
    clear
    echo -e "${C}${BD}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║ 📡 SEVEN7 SECURITY MONITOR v1.0 ║"
    echo "║ Surveillance temps réel des tentatives d'intrusion ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e " ${BD}Configuration:${NC}"
    echo -e " Intervalle: ${C}${INTERVAL}s${NC}"
    [ -n "$SLACK_WEBHOOK" ] && echo -e " Slack: ${G}Activé${NC}" || echo -e " Slack: ${R}Désactivé${NC}"
    [ -n "$DISCORD_WEBHOOK" ] && echo -e " Discord: ${G}Activé${NC}" || echo -e " Discord: ${R}Désactivé${NC}"
    echo -e " Log: ${C}$LOG_FILE${NC}"
    echo ""
    echo -e " ${BD}Domaines surveillés:${NC}"
    for d in "${DOMAINS[@]}"; do
        echo -e " • $d"
    done
    echo ""
    echo -e " ${Y}Appuyez sur Ctrl+C pour arrêter${NC}"
    echo ""
}

# ============================================================================
# GESTION DES ARGUMENTS
# ============================================================================

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --slack-webhook)
                SLACK_WEBHOOK="$2"
                shift 2
                ;;
            --discord-webhook)
                DISCORD_WEBHOOK="$2"
                shift 2
                ;;
            --interval)
                INTERVAL="$2"
                shift 2
                ;;
            --log-file)
                LOG_FILE="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo " --slack-webhook URL Webhook Slack"
                echo " --discord-webhook URL Webhook Discord"
                echo " --interval SECONDS Intervalle de scan"
                echo " --log-file PATH Fichier de log"
                exit 0
                ;;
            *)
                shift
                ;;
        esac
    done
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    parse_args "$@"

    touch "$LOG_FILE"

    banner
    sleep 2

    trap 'echo -e "\n${Y}Arrêt du monitor...${NC}"; exit 0' INT TERM

    while true; do
        scan_all

        for ((i=INTERVAL; i>0; i--)); do
            printf "\r ${BD}Prochain scan dans: ${C}%3d${NC} secondes " "$i"
            sleep 1
        done
        printf "\r%-50s\r" ""
    done
}

main "$@"
