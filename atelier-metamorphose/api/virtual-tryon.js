// ============================================================================
// Fonction serverless Vercel : déclenche l'essayage virtuel (CatVTON-Flux)
// sur le serveur ComfyUI dédié. Reçoit les noms de fichiers déjà uploadés
// côté ComfyUI (via son endpoint /upload/image) et lance le rendu.
// ============================================================================

const COMFYUI_API_URL = process.env.COMFYUI_URL || 'http://votre-ip-gpu:8188/prompt';

function buildWorkflow(clientImageName, garmentImageName) {
  return {
    '1': {
      inputs: { image: clientImageName },
      class_type: 'LoadImage',
    },
    '2': {
      inputs: { image: garmentImageName },
      class_type: 'LoadImage',
    },
    '3': {
      inputs: {
        pretrained_model: 'QuantFasion/CatVTON-Flux-v1',
        cloth_alignment: true,
      },
      class_type: 'CatVTONModelLoader',
    },
    '4': {
      inputs: {
        steps: 20,
        cfg: 3.5,
        sampler_name: 'euler',
        scheduler: 'normal',
        denoise: 1.0,
        model: ['3', 0],
        person_image: ['1', 0],
        cloth_image: ['2', 0],
      },
      class_type: 'CatVTONSampler',
    },
    '5': {
      inputs: {
        filename_prefix: 'metamorphose_output',
        images: ['4', 0],
      },
      class_type: 'SaveImage',
    },
  };
}

async function handleVirtualTryOn(clientImageName, garmentImageName) {
  try {
    const response = await fetch(COMFYUI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: buildWorkflow(clientImageName, garmentImageName) }),
    });

    if (!response.ok) {
      throw new Error(`Serveur ComfyUI injoignable : ${response.statusText}`);
    }

    const data = await response.json();

    // Renvoie l'ID de la tâche (Prompt ID) pour suivre l'avancement en temps réel.
    return {
      success: true,
      promptId: data.prompt_id,
      message: 'Génération de la seconde peau numérique lancée.',
    };
  } catch (error) {
    console.error('Erreur lors du transfert de vêtement IA :', error);
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée, utilisez POST.' });
    return;
  }

  const { clientImageName, garmentImageName } = req.body ?? {};

  if (!clientImageName || !garmentImageName) {
    res.status(400).json({ error: 'clientImageName et garmentImageName sont requis.' });
    return;
  }

  const result = await handleVirtualTryOn(clientImageName, garmentImageName);

  res.status(result.success ? 200 : 502).json(result);
}
