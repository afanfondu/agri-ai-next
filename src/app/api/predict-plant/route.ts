import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

// List of plant classes we can identify
const PLANT_CLASSES = [
  "Aloevera",
  "Amla",
  "Amruthaballi",
  "Arali",
  "Astma_weed",
  "Badipala",
  "Balloon_Vine",
  "Bamboo",
  "Beans",
  "Betel",
  "Bhrami",
  "Bringaraja",
  "Caricature",
  "Castor",
  "Catharanthus",
  "Chakte",
  "Chilly",
  "Citron lime (herelikai)",
  "Coffee",
  "Common rue(naagdalli)",
  "Coriender",
  "Curry",
  "Doddpathre",
  "Drumstick",
  "Ekka",
  "Eucalyptus",
  "Ganigale",
  "Ganike",
  "Gasagase",
  "Ginger",
  "Globe Amarnath",
  "Guava",
  "Henna",
  "Hibiscus",
  "Honge",
  "Insulin",
  "Jackfruit",
  "Jasmine",
  "Kambajala",
  "Kasambruga",
  "Kohlrabi",
  "Lantana",
  "Lemon",
  "Lemongrass",
  "Malabar_Nut",
  "Malabar_Spinach",
  "Mango",
  "Marigold",
  "Mint",
  "Neem",
  "Nelavembu",
  "Nerale",
  "Nooni",
  "Onion",
  "Padri",
  "Palak(Spinach)",
  "Papaya",
  "Parijatha",
  "Pea",
  "Pepper",
  "Pomoegranate",
  "Pumpkin",
  "Raddish",
  "Rose",
  "Sampige",
  "Sapota",
  "Seethaashoka",
  "Seethapala",
  "Spinach1",
  "Tamarind",
  "Taro",
  "Tecoma",
  "Thumbe",
  "Tomato",
  "Tulsi",
  "Turmeric",
  "ashoka",
  "camphor",
  "kamakasturi",
  "kepala",
];

const AYURVEDIC_INFO: Record<string, { description: string; uses: string[] }> =
  {
    Aloevera: {
      description:
        "Aloe vera is a succulent plant known for its gel, which has soothing and healing properties.",
      uses: [
        "Treating skin burns and wounds",
        "Moisturizing skin",
        "Reducing inflammation",
        "Aiding digestion (used cautiously)",
      ],
    },
    Amla: {
      description:
        "Amla (Indian Gooseberry) is a fruit rich in Vitamin C and antioxidants, highly valued in Ayurveda.",
      uses: [
        "Boosting immunity",
        "Improving hair and skin health",
        "Supporting digestion",
        "Enhancing eye health",
      ],
    },
    Amruthaballi: {
      description:
        "Amruthaballi (Guduchi/Tinospora cordifolia) is a potent immunomodulator and rejuvenative herb.",
      uses: [
        "Boosting immunity",
        "Reducing fever",
        "Managing diabetes",
        "Detoxifying the body",
      ],
    },
    Astma_weed: {
      description:
        "Asthma Weed (Tylophora indica) is traditionally used for respiratory ailments.",
      uses: [
        "Treating asthma and bronchitis",
        "As an expectorant",
        "Anti-inflammatory properties (used with caution)",
      ],
    },
    Betel: {
      description:
        "Betel leaf is commonly chewed with areca nut and lime, and has digestive and stimulant properties.",
      uses: [
        "Aiding digestion",
        "Freshening breath",
        "Mild stimulant",
        "Treating minor infections",
      ],
    },
    Bhrami: {
      description:
        "Brahmi (Bacopa monnieri) is a renowned herb for enhancing memory and cognitive function.",
      uses: [
        "Improving memory and concentration",
        "Reducing anxiety and stress",
        "Supporting brain health",
        "Promoting restful sleep",
      ],
    },
    Bringaraja: {
      description:
        "Bringaraja (Eclipta alba) is famous in Ayurveda for promoting hair growth and liver health.",
      uses: [
        "Promoting hair growth and preventing hair loss",
        "Supporting liver function",
        "Treating skin disorders",
        "Improving vision",
      ],
    },
    "Common rue(naagdalli)": {
      description:
        "Common Rue is a strong-scented herb with antispasmodic and insect-repelling properties.",
      uses: [
        "Relieving muscle spasms and cramps",
        "As an insect repellent",
        "Treating menstrual disorders (used cautiously)",
        "Anti-inflammatory effects",
      ],
    },
    Curry: {
      description:
        "Curry leaves are aromatic leaves used in cooking, known for their digestive and antioxidant benefits.",
      uses: [
        "Aiding digestion",
        "Managing diabetes",
        "Improving hair health",
        "Rich source of antioxidants",
      ],
    },
    Doddpathre: {
      description:
        "Doddapatre (Indian Borage) is used traditionally for coughs, colds, and sore throats.",
      uses: [
        "Relieving cough and cold symptoms",
        "Soothing sore throats",
        "Treating respiratory infections",
        "Aiding digestion",
      ],
    },
    Eucalyptus: {
      description:
        "Eucalyptus leaves contain oil known for its decongestant and antiseptic properties.",
      uses: [
        "Relieving cough and cold symptoms (inhalation)",
        "Easing respiratory congestion",
        "Antiseptic for wounds",
        "Pain relief (topical)",
      ],
    },
    Ginger: {
      description:
        "Ginger is a warming spice widely used for its digestive, anti-inflammatory, and anti-nausea effects.",
      uses: [
        "Aiding digestion",
        "Reducing nausea and motion sickness",
        "Anti-inflammatory for joint pain",
        "Relieving cold and flu symptoms",
      ],
    },
    Guava: {
      description:
        "Guava leaves are known for their antidiarrheal, antioxidant, and antimicrobial properties.",
      uses: [
        "Treating diarrhea",
        "Managing blood sugar levels",
        "Boosting immunity",
        "Improving skin health",
      ],
    },
    Henna: {
      description:
        "Henna is primarily used as a natural dye but also has cooling and astringent properties.",
      uses: [
        "Natural hair and skin dye",
        "Cooling agent for skin",
        "Treating minor skin irritations",
        "Strengthening hair",
      ],
    },
    Hibiscus: {
      description:
        "Hibiscus flowers and leaves are used in teas and remedies for their antioxidant and cooling effects.",
      uses: [
        "Lowering blood pressure",
        "Rich in antioxidants",
        "Promoting hair growth",
        "Cooling the body",
      ],
    },
    Insulin: {
      description:
        "Insulin Plant (Costus igneus) leaves are traditionally used to help manage blood sugar levels.",
      uses: [
        "Supporting blood sugar management in diabetes (consult doctor)",
        "Diuretic properties",
        "Antioxidant effects",
      ],
    },
    Lemon: {
      description:
        "Lemon leaves and fruit are rich in Vitamin C and have cleansing and refreshing properties.",
      uses: [
        "Boosting immunity (fruit)",
        "Aiding digestion",
        "Skin cleansing",
        "Flavoring agent",
      ],
    },
    Lemongrass: {
      description:
        "Lemongrass is an aromatic grass used in cooking and teas, known for its calming and digestive benefits.",
      uses: [
        "Aiding digestion",
        "Reducing anxiety and stress",
        "Relieving pain and inflammation",
        "Antioxidant properties",
      ],
    },
    Malabar_Nut: {
      description:
        "Malabar Nut (Adhatoda vasica) is a well-known remedy for respiratory conditions like cough and asthma.",
      uses: [
        "Treating cough and bronchitis",
        "As an expectorant",
        "Relieving asthma symptoms",
        "Anti-inflammatory",
      ],
    },
    Mint: {
      description:
        "Mint leaves are refreshing and commonly used for digestive issues and flavoring.",
      uses: [
        "Aiding digestion and relieving indigestion",
        "Soothing upset stomach",
        "Freshening breath",
        "Relieving headaches",
      ],
    },
    Neem: {
      description:
        "Neem is a powerful herb known for its bitter taste and potent antibacterial, antiviral, and antifungal properties.",
      uses: [
        "Treating skin infections and acne",
        "Purifying blood",
        "Supporting dental health",
        "Boosting immunity",
      ],
    },
    Nelavembu: {
      description:
        "Nelavembu (Andrographis paniculata) is extremely bitter and used traditionally for fevers and infections.",
      uses: [
        "Reducing fever (especially viral)",
        "Treating cold and flu symptoms",
        "Boosting immunity",
        "Liver protection",
      ],
    },
    Papaya: {
      description:
        "Papaya leaves contain enzymes and compounds beneficial for digestion and platelet count.",
      uses: [
        "Aiding digestion (fruit)",
        "Increasing platelet count in dengue fever (leaf extract - consult doctor)",
        "Anti-inflammatory properties",
        "Improving skin health",
      ],
    },
    Pepper: {
      description:
        "Black Pepper enhances digestion and bioavailability of other nutrients and herbs.",
      uses: [
        "Improving digestion",
        "Enhancing nutrient absorption",
        "Relieving cough and cold",
        "Antioxidant properties",
      ],
    },
    Pomoegranate: {
      description:
        "Pomegranate leaves and fruit are rich in antioxidants and have various health benefits.",
      uses: [
        "Rich in antioxidants (fruit)",
        "Supporting heart health",
        "Anti-inflammatory effects",
        "Aiding digestion (leaves)",
      ],
    },
    Tulsi: {
      description:
        "Tulsi (Holy Basil) is a sacred herb in Ayurveda, known for its adaptogenic, immune-boosting, and stress-relieving properties.",
      uses: [
        "Reducing stress and anxiety",
        "Boosting immunity",
        "Relieving cough and cold",
        "Supporting respiratory health",
      ],
    },
    Turmeric: {
      description:
        "Turmeric contains curcumin, a potent anti-inflammatory and antioxidant compound.",
      uses: [
        "Reducing inflammation",
        "Supporting joint health",
        "Boosting immunity",
        "Aiding digestion",
      ],
    },
    ashoka: {
      description:
        "Ashoka tree bark is traditionally used in Ayurveda for women's health issues.",
      uses: [
        "Managing menstrual disorders",
        "Relieving menstrual pain",
        "Supporting uterine health",
        "Anti-inflammatory",
      ],
    },
    camphor: {
      description:
        "Camphor has a strong aroma and is used topically for pain relief and decongestion.",
      uses: [
        "Relieving pain and inflammation (topical)",
        "Decongestant for colds (inhalation/rub)",
        "Antifungal properties",
        "Insect repellent",
      ],
    },
    Drumstick: {
      description:
        "Moringa (Drumstick) leaves are exceptionally nutritious and have multiple medicinal benefits.",
      uses: [
        "Boosting nutrition and treating malnutrition",
        "Anti-inflammatory properties",
        "Supporting immune function",
        "Lowering blood sugar levels",
      ],
    },
    Tamarind: {
      description:
        "Tamarind is sour-tasting and used in Ayurveda for its digestive and mild laxative properties.",
      uses: [
        "Aiding digestion",
        "Mild natural laxative",
        "Reducing inflammation",
        "Rich source of antioxidants",
      ],
    },
    Jasmine: {
      description:
        "Jasmine flowers have a calming fragrance and are used for their relaxing and mood-enhancing effects.",
      uses: [
        "Calming the mind and reducing stress",
        "Improving mood",
        "Mild sedative effect",
        "Fragrance therapy",
      ],
    },
    Thumbe: {
      description:
        "Thumbe (Leucas aspera) is commonly used in folk medicine for various ailments including respiratory issues.",
      uses: [
        "Treating cold and cough",
        "Relieving headaches",
        "Anti-inflammatory properties",
        "Insect bite treatment",
      ],
    },
    Rose: {
      description:
        "Rose petals and oil have cooling properties and are used in various Ayurvedic formulations.",
      uses: [
        "Cooling the body",
        "Improving skin health",
        "Mild laxative",
        "Calming the mind",
      ],
    },
    Marigold: {
      description:
        "Marigold flowers have antiseptic and anti-inflammatory properties, commonly used for skin and eye conditions.",
      uses: [
        "Treating skin inflammation",
        "Eye health (as eye wash)",
        "Wound healing",
        "Reducing swelling",
      ],
    },
    kamakasturi: {
      description:
        "Kamakasturi (Abelmoschus moschatus) seeds are used in Ayurvedic medicine for nervous system disorders.",
      uses: [
        "Nervous system disorders",
        "Digestive issues",
        "As an aphrodisiac (traditional use)",
        "Antispasmodic properties",
      ],
    },
    kepala: {
      description:
        "Kepala (Butterfly Pea) flowers are used for their cognitive-enhancing properties and striking blue color.",
      uses: [
        "Enhancing memory and cognition",
        "Hair treatments",
        "Eye health",
        "Natural food coloring",
      ],
    },
  };

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        {
          status: "error",
          message: "No image file provided",
        },
        { status: 400 },
      );
    }

    // Convert file to base64 to send to Gemini
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = buffer.toString("base64");

    // Get the Gemini model
    const model = getGeminiModel();

    // Prepare the prompt for Gemini
    const prompt = `
      You are an expert in identifying medicinal plants from the following dataset:
      ${PLANT_CLASSES.join(", ")}.

      Analyze this plant leaf image and:
      1. Identify which plant it belongs to from the provided list
      2. If it's not one of these plants or if the image is not clear, indicate that
      3. Provide a confidence score (0-1.0)
      4. If it's a medicinal plant, describe its ayurvedic properties and uses
      
      Format your response as JSON with the following structure:
      {
        "class_name": "Plant name",
        "confidence": 0.95,
        "is_medicinal": true/false,
        "ayurvedic_info": {
          "description": "brief description",
          "uses": ["use 1", "use 2", "use 3"]
        },
        "message": "any additional information"
      }
    `;

    // Send request to Gemini API
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      },
    ]);

    // Process the response
    const response = await result.response;
    const responseText = response.text();

    // Parse the JSON from the response
    let jsonResponse;
    try {
      // Find the JSON object in the response by looking for patterns
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON response not found");
      }
    } catch (error) {
      console.error("Error parsing JSON from Gemini response:", error);
      console.log("Raw response:", responseText);

      // Return a default response if we can't parse the JSON
      return NextResponse.json(
        {
          status: "error",
          message:
            "Could not interpret the plant image. Please try again with a clearer image.",
        },
        { status: 500 },
      );
    }

    console.log("json res", jsonResponse);

    // Format the response in the same structure as the original API
    const plantClass = jsonResponse.class_name;
    const confidence = jsonResponse.confidence;
    const isMedicinal = Object.keys(AYURVEDIC_INFO).includes(plantClass);

    // Get ayurvedic info or create a default
    let ayurvedicInfo =
      AYURVEDIC_INFO[plantClass] || jsonResponse.ayurvedic_info;

    if (!isMedicinal) {
      ayurvedicInfo = {
        description: "This plant is not commonly used in Ayurvedic medicine.",
        uses: ["N/A"],
      };
    }

    // Create simulated top predictions (we'll only include the main prediction for simplicity)
    const predictionResult = {
      status: "success",
      prediction: {
        class_name: plantClass,
        confidence: confidence,
        class_index: PLANT_CLASSES.indexOf(plantClass),
        ayurvedic_info: ayurvedicInfo,
      },
      // We'll skip the top predictions since they're less relevant with the Gemini approach
      // But maintain the field for API compatibility
      top_predictions: [
        {
          class_name: plantClass,
          confidence: confidence,
          class_index: PLANT_CLASSES.indexOf(plantClass),
          ayurvedic_info: ayurvedicInfo,
        },
      ],
    };

    return NextResponse.json(predictionResult);
  } catch (error) {
    console.error("Error processing plant prediction:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
