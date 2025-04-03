import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import User from "@/models/User";
import Prediction from "@/models/Predict";
import dbConfig from "@/middlewares/db.config";

const suggestions = {
  "Early Blight": {
    en: [
      "Remove affected leaves and dispose of them properly.",
      "Apply fungicides as per the manufacturer's instructions.",
      "Ensure proper air circulation around plants to reduce humidity.",
      "Rotate crops to prevent recurrence in the next planting season.",
      "Consider using resistant varieties in future plantings.",
    ],
    hi: [
      "प्रभावित पानांना काढा आणि त्यांना योग्य प्रकारे नष्ट करा.",
      "निर्मात्याच्या सूचनांनुसार फंगिसाइड्स लागू करा.",
      "आर्द्रता कमी करण्यासाठी वनस्पतींमध्ये योग्य हवेचा प्रवाह सुनिश्चित करा.",
      "पुढील लागवडीच्या हंगामात पुनरावृत्ती टाळण्यासाठी पिके फिरवा.",
      "भविष्यातील लागवडीसाठी प्रतिरोधक जाती वापरणाचा विचार करा.",
    ],
    mr: [
      "प्रभावित पानांना काढा आणि त्यांना योग्य प्रकारे नष्ट करा.",
      "निर्मात्याच्या सूचनांनुसार फंगिसाइड्स लागू करा.",
      "आर्द्रता कमी करण्यासाठी वनस्पतींमध्ये योग्य हवेचा प्रवाह सुनिश्चित करा.",
      "पुढील लागवडीच्या हंगामात पुनरावृत्ती टाळण्यासाठी पिके फिरवा.",
      "भविष्यातील लागवडीसाठी प्रतिरोधक जाती वापरणाचा विचार करा.",
    ],
    ta: [
      "பாதிக்கப்பட்ட இலைகளை அகற்று மற்றும் அவற்றை முறையாக அழிக்கவும்.",
      "உற்பத்தியாளரின் அறிவுறுத்தலின்படி பூஞ்சிகர்மிகள் பயன்படுத்தவும்.",
      "ஊதுகாற்று சுழற்சியை உறுதி செய்யவும்.",
      "அடுத்த பயிரிடும் பருவத்தில் மீண்டும் நிகழ்வதைத் தவிர்க்கவும்.",
      "எதிர்கால பயிரிடலுக்கு எதிர்ப்பு வகைகளைப் பயன்படுத்த பரிந்துரை செய்கிறது.",
    ],
    te: [
      "ప్రభావిత ఆకులను తొలగించండి మరియు వాటిని సరిగ్గా నాశనం చేయండి.",
      "తయారకర్త యొక్క సూచనల ప్రకారం ఫంగిసైడ్స్‌ను వర్తింపజేయండి.",
      "ఆకుల మధ్య సరైన గాలి ప్రసరణను నిర్ధారించండి.",
      "తరువాతి పంట సాగు సీజన్‌లో పునరావృతాన్ని నివారించడానికి పంటలను తిరగండి.",
      "భవిష్యత్తులో ప్రతిఘటకమైన రకాలను పండించడానికి పరిగణించండి.",
    ],
  },
  "Late Blight": {
    en: [
      "Remove and destroy infected plants immediately.",
      "Apply fungicides specifically designed for late blight.",
      "Ensure proper spacing between plants to improve airflow.",
      "Avoid overhead watering to reduce humidity around the plants.",
      "Consider planting resistant potato varieties in the future.",
    ],
    hi: [
      "संक्रमित वनस्पती तात्काळ काढा आणि नष्ट करा.",
      "उशिरा गंजण्यासाठी विशेषतः डिझाइन केलेले फंगिसाइड्स लागू करा.",
      "हवेच्या प्रवाहाला सुधारण्यासाठी वनस्पतींमध्ये योग्य अंतर सुनिश्चित करा.",
      "वनस्पतींच्या आजुबाजुच्या आर्द्रतेला कमी करण्यासाठी वरच्या पाण्याचा वापर टाळा.",
      "भविष्यात प्रतिरोधक बटाट्याच्या जाती लागवड करण्याचा विचार करा.",
    ],
    mr: [
      "संक्रमित वनस्पती तात्काळ काढा आणि नष्ट करा.",
      "उशिरा गंजण्यासाठी विशेषतः डिझाइन केलेले फंगिसाइड्स लागू करा.",
      "हवेच्या प्रवाहाला सुधारण्यासाठी वनस्पतींमध्ये योग्य अंतर सुनिश्चित करा.",
      "वनस्पतींच्या आजुबाजुच्या आर्द्रतेला कमी करण्यासाठी वरच्या पाण्याचा वापर टाळा.",
      "भविष्यात प्रतिरोधक बटाट्याच्या जाती लागवड करण्याचा विचार करा.",
    ],
    ta: [
      "துரிதமாக பாதிக்கப்பட்ட தாவரங்களை அகற்றவும் அழிக்கவும்.",
      "கடுமையான பூஞ்சிகர்மிகளுக்கு உரிய பூஞ்சிகர்மிகளைப் பயன்படுத்தவும்.",
      "காற்றோட்டத்தை மேம்படுத்த தாவரங்களுக்கு இடைவெளி வைக்கவும்.",
      "தாவரங்களின் சுற்றிலும் ஈரப்பதத்தை குறைக்க மேலே நீரைத் தவிர்க்கவும்.",
      "எதிர்காலத்தில் எதிர்ப்பு கொண்ட உருளைக்கிழங்கு வகைகளை நடவிட பரிந்துரை செய்கிறது.",
    ],
    te: [
      "ప్రభావిత మొక్కలను వెంటనే తొలగించండి మరియు నాశనం చేయండి.",
      "ఉన్నతమైన పాడి కోసం ప్రత్యేకంగా రూపొందించిన ఫంగిసైడ్స్‌ను వర్తింపజేయండి.",
      "గాలి ప్రవాహాన్ని మెరుగుపరచడానికి మొక్కల మధ్య సరైన అంతరాన్ని నిర్ధారించండి.",
      "మొక్కల చుట్టూ ఆర్ద్రతను తగ్గించడానికి పైకి నీటిని నివారించండి.",
      "భవిష్యత్తులో ప్రతిఘటకమైన బంగాళాదుంప రకాలను పండించడానికి పరిగణించండి.",
    ],
  },
  Healthy: {
    en: [
      "No action needed. Your potato plants are healthy!",
      "Continue regular monitoring and care for your plants.",
      "Maintain good agricultural practices to ensure plant health.",
    ],
    hi: [
      "कोई कार्रवाई की आवश्यकता नहीं। आपके आलू के पौधे स्वस्थ हैं!",
      "अपने पौधों की नियमित निगरानी और देखभाल जारी रखें।",
      "पौधों के स्वास्थ्य को सुनिश्चित करने के लिए अच्छे कृषि अभ्यास बनाए रखें।",
    ],
    mr: [
      "कोई कार्रवाई की आवश्यकता नहीं। आपके आलू के पौधे स्वस्थ हैं!",
      "अपने पौधों की नियमित निगरानी और देखभाल जारी रखें।",
      "पौधों के स्वास्थ्य को सुनिश्चित करने के लिए अच्छे कृषि अभ्यास बनाए रखें।",
    ],
    ta: [
      "எந்த நடவடிக்கையும் தேவையில்லை. உங்கள் உருளைக்கிழங்கு தாவரங்கள் ஆரோக்கியமாக உள்ளன!",
      "உங்கள் தாவரங்களுக்கு வழக்கமான கண்காணிப்பு மற்றும் பராமரிப்பை தொடருங்கள்.",
      "தாவர ஆரோக்கியத்தை உறுதி செய்ய நல்ல விவசாய நடைமுறைகளை பராமரிக்கவும்.",
    ],
    te: [
      "ఏ చర్య అవసరం లేదు. మీ బంగాళాదుంప మొక్కలు ఆరోగ్యంగా ఉన్నాయి!",
      "మీ మొక్కల కోసం సాధారణంగా పర్యవేక్షణ మరియు సంరక్షణ కొనసాగించండి.",
      "మొక్కల ఆరోగ్యాన్ని నిర్ధారించడానికి మంచి వ్యవసాయ పద్ధతులను నిర్వహించండి.",
    ],
  },
};

const execAsync = promisify(exec);

dbConfig();

export async function POST(req: Request) {
  const { image, email, language } = await req.json();
  if (!image || !email) {
    return Response.json({ message: "User not logged in" }, { status: 400 });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }
    const buffer = Buffer.from(image, "base64");
    const imagePath = "python/user.jpg";
    fs.writeFileSync(imagePath, buffer);

    const { stdout, stderr } = await execAsync(
      `py -3.12 python/run.py ${imagePath}`
    );
    fs.unlinkSync(imagePath);
    console.log("stdout:", stdout);
    const prediction = JSON.parse(stdout.trim().split("\n").pop()!);
    let response = {
      prediction: prediction.class,
      confidence: prediction.confidence,
      interpretation: "",
      textClass:
        prediction.confidence >= 0.8
          ? "green"
          : prediction.confidence >= 0.5
          ? "orange"
          : "red",
      suggestions: [],
    };

    switch (language) {
      case "en": {
        switch (prediction.class) {
          case "Early Blight":
            response.prediction = "Early Blight";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `We are confident this is ${response.prediction}.`
                : response.confidence >= 50
                ? `We think this might be ${response.prediction}, but consider a second opinion or re-capture the image.`
                : `We are unsure about the result but we are assuming ${response.prediction}. Try uploading a clearer image or consult an expert.`;
            response.suggestions = suggestions["Early Blight"][language];
            break;
          case "Late Blight":
            response.prediction = "Late Blight";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `We are confident this is ${response.prediction}.`
                : response.confidence >= 50
                ? `We think this might be ${response.prediction}, but consider a second opinion or re-capture the image.`
                : `We are unsure about the result but we are assuming ${response.prediction}. Try uploading a clearer image or consult an expert.`;
            response.suggestions = suggestions["Late Blight"][language];
            break;
          case "Healthy":
            response.prediction = "Healthy";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `We are confident this is ${response.prediction}.`
                : response.confidence >= 50
                ? `We think this might be ${response.prediction}, but consider a second opinion or re-capture the image.`
                : `We are unsure about the result but we are assuming ${response.prediction}. Try uploading a clearer image or consult an expert.`;
            response.suggestions = suggestions["Healthy"][language];
            break;
          default:
            response.prediction = "Unknown condition";
            response.confidence = 0;
            response.interpretation =
              response.confidence >= 80
                ? `We are confident this is ${response.prediction}.`
                : response.confidence >= 50
                ? `We think this might be ${response.prediction}, but consider a second opinion or re-capture the image.`
                : `We are unsure about the result but we are assuming ${response.prediction}. Try uploading a clearer image or consult an expert.`;
            response.suggestions = suggestions["Healthy"][language];
            break;
        }
        break;
      }
      case "hi":
        switch (prediction.class) {
          case "Early Blight":
            response.prediction = "प्रारंभिक गंज";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `हमें विश्वास है कि यह ${response.prediction} है।`
                : response.confidence >= 50
                ? `हमें लगता है कि यह ${response.prediction} हो सकता है, लेकिन एक दूसरा राय लेने पर विचार करें या छवि को फिर से कैप्चर करें।`
                : `हम परिणाम के बारे में अनिश्चित हैं लेकिन हम ${response.prediction} मान रहे हैं। एक स्पष्ट छवि अपलोड करने का प्रयास करें या किसी विशेषज्ञ से परामर्श करें।`;
            response.suggestions = suggestions["Early Blight"][language];
            break;
          case "Late Blight":
            response.prediction = "लेट ब्लाइट";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `हमें विश्वास है कि यह ${response.prediction} है।`
                : response.confidence >= 50
                ? `हमें लगता है कि यह ${response.prediction} हो सकता है, लेकिन एक दूसरा राय लेने पर विचार करें या छवि को फिर से कैप्चर करें।`
                : `हम परिणाम के बारे में अनिश्चित हैं लेकिन हम ${response.prediction} मान रहे हैं। एक स्पष्ट छवि अपलोड करने का प्रयास करें या किसी विशेषज्ञ से परामर्श करें।`;
            response.suggestions = suggestions["Late Blight"][language];
            break;
          case "Healthy":
            response.prediction = "स्वस्थ";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `हमें विश्वास है कि यह ${response.prediction} है।`
                : response.confidence >= 50
                ? `हमें लगता है कि यह ${response.prediction} हो सकता है, लेकिन एक दूसरा राय लेने पर विचार करें या छवि को फिर से कैप्चर करें।`
                : `हम परिणाम के बारे में अनिश्चित हैं लेकिन हम ${response.prediction} मान रहे हैं। एक स्पष्ट छवि अपलोड करने का प्रयास करें या किसी विशेषज्ञ से परामर्श करें।`;
            response.suggestions = suggestions["Healthy"][language];
            break;
          default:
            response.prediction = "अज्ञात स्थिती";
            response.confidence = 0;
            response.interpretation =
              response.confidence >= 80
                ? `हमें विश्वास है कि यह ${response.prediction} है।`
                : response.confidence >= 50
                ? `हमें लगता है कि यह ${response.prediction} हो सकता है, लेकिन एक दूसरा राय लेने पर विचार करें या छवि को फिर से कैप्चर करें।`
                : `हम परिणाम के बारे में अनिश्चित हैं लेकिन हम ${response.prediction} मान रहे हैं। एक स्पष्ट छवि अपलोड करने का प्रयास करें या किसी विशेषज्ञ से परामर्श करें।`;
            response.suggestions = suggestions["Healthy"][language];
            break;
        }
        break;
      case "mr":
        switch (prediction.class) {
          case "Early Blight":
            response.prediction = "प्रारंभिक ब्लीट";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `आम्हाला विश्वास आहे की हे ${response.prediction} आहे.`
                : response.confidence >= 50
                ? `आम्हाला वाटते की हे ${response.prediction} असू शकते, परंतु दुसऱ्या मतावर विचार करा किंवा इमेज पुन्हा कॅप्चर करा.`
                : `आम्ही परिणामावर अनिश्चित आहोत पण आम्ही ${response.prediction} मानत आहोत. कृपया स्पष्ट इमेज अपलोड करा किंवा तज्ञाची सल्ला घ्या.`;
            response.suggestions = suggestions["Early Blight"][language];
            break;
          case "Late Blight":
            response.prediction = "लेट ब्लीट";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `आम्हाला विश्वास आहे की हे ${response.prediction} आहे.`
                : response.confidence >= 50
                ? `आम्हाला वाटते की हे ${response.prediction} असू शकते, परंतु दुसऱ्या मतावर विचार करा किंवा इमेज पुन्हा कॅप्चर करा.`
                : `आम्ही परिणामावर अनिश्चित आहोत पण आम्ही ${response.prediction} मानत आहोत. कृपया स्पष्ट इमेज अपलोड करा किंवा तज्ञाची सल्ला घ्या.`;
            response.suggestions = suggestions["Late Blight"][language];
            break;
          case "Healthy":
            response.prediction = "स्वस्थ";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `आम्हाला विश्वास आहे की हे ${response.prediction} आहे.`
                : response.confidence >= 50
                ? `आम्हाला वाटते की हे ${response.prediction} असू शकते, परंतु दुसऱ्या मतावर विचार करा किंवा इमेज पुन्हा कॅप्चर करा.`
                : `आम्ही परिणामावर अनिश्चित आहोत पण आम्ही ${response.prediction} मानत आहोत. कृपया स्पष्ट इमेज अपलोड करा किंवा तज्ञाची सल्ला घ्या.`;
            response.suggestions = suggestions["Healthy"][language];
            break;
          default:
            response.prediction = "अज्ञात स्थिती";
            response.confidence = 0;
            response.interpretation =
              response.confidence >= 80
                ? `आम्हाला विश्वास आहे की हे ${response.prediction} आहे.`
                : response.confidence >= 50
                ? `आम्हाला वाटते की हे ${response.prediction} असू शकते, परंतु दुसऱ्या मतावर विचार करा किंवा इमेज पुन्हा कॅप्चर करा.`
                : `आम्ही परिणामावर अनिश्चित आहोत पण आम्ही ${response.prediction} मानत आहोत. कृपया स्पष्ट इमेज अपलोड करा किंवा तज्ञाची सल्ला घ्या.`;
            response.suggestions = suggestions["Healthy"][language];
            break;
        }
        break;
      case "ta":
        switch (prediction.class) {
          case "Early Blight":
            response.prediction = "பிராரம்பிக பூஞ்சை";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `நாங்கள் இது ${response.prediction} என நம்புகிறோம்.`
                : response.confidence >= 50
                ? `இதுவே ${response.prediction} என்று நாங்கள் எண்ணுகிறோம், ஆனால் இரண்டாம் கருத்தை பெறுவதற்காக அல்லது படம் மறுபடியும் எடுக்கவும்.`
                : `நாங்கள் முடிவை பற்றி உறுதி செய்யவில்லை ஆனால் ${response.prediction} என்று நாம் கருதுகிறோம். தெளிவான படம் பதிவேற்ற முயற்சி செய்யவும் அல்லது நிபுணரிடம் ஆலோசனை பெறவும்.`;
            response.suggestions = suggestions["Early Blight"][language];
            break;
          case "Late Blight":
            response.prediction = "இரவு பூஞ்சை";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `நாங்கள் இது ${response.prediction} என நம்புகிறோம்.`
                : response.confidence >= 50
                ? `இதுவே ${response.prediction} என்று நாங்கள் எண்ணுகிறோம், ஆனால் இரண்டாம் கருத்தை பெறுவதற்காக அல்லது படம் மறுபடியும் எடுக்கவும்.`
                : `நாங்கள் முடிவை பற்றி உறுதி செய்யவில்லை ஆனால் ${response.prediction} என்று நாம் கருதுகிறோம். தெளிவான படம் பதிவேற்ற முயற்சி செய்யவும் அல்லது நிபுணரிடம் ஆலோசனை பெறவும்.`;
            response.suggestions = suggestions["Late Blight"][language];
            break;
          case "Healthy":
            response.prediction = "ஆரோக்கியம்";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `நாங்கள் இது ${response.prediction} என நம்புகிறோம்.`
                : response.confidence >= 50
                ? `இதுவே ${response.prediction} என்று நாங்கள் எண்ணுகிறோம், ஆனால் இரண்டாம் கருத்தை பெறுவதற்காக அல்லது படம் மறுபடியும் எடுக்கவும்.`
                : `நாங்கள் முடிவை பற்றி உறுதி செய்யவில்லை ஆனால் ${response.prediction} என்று நாம் கருதுகிறோம். தெளிவான படம் பதிவேற்ற முயற்சி செய்யவும் அல்லது நிபுணரிடம் ஆலோசனை பெறவும்.`;
            response.suggestions = suggestions["Healthy"][language];
            break;
          default:
            response.prediction = "அறியப்படாத நிலை";
            response.confidence = 0;
            response.interpretation =
              response.confidence >= 80
                ? `நாங்கள் இது ${response.prediction} என நம்புகிறோம்.`
                : response.confidence >= 50
                ? `இதுவே ${response.prediction} என்று நாங்கள் எண்ணுகிறோம், ஆனால் இரண்டாம் கருத்தை பெறுவதற்காக அல்லது படம் மறுபடியும் எடுக்கவும்.`
                : `நாங்கள் முடிவை பற்றி உறுதி செய்யவில்லை ஆனால் ${response.prediction} என்று நாம் கருதுகிறோம். தெளிவான படம் பதிவேற்ற முயற்சி செய்யவும் அல்லது நிபுணரிடம் ஆலோசனை பெறவும்.`;
            response.suggestions = suggestions["Healthy"][language];
            break;
        }
        break;
      case "te":
        switch (prediction.class) {
          case "Early Blight":
            response.prediction = "ప్రారంభ బ్లైట్";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `మేము ఇది ${response.prediction} అని నమ్ముతున్నాము.`
                : response.confidence >= 50
                ? `మేము ఇది ${response.prediction} కావచ్చు అని అనుకుంటున్నాము, కానీ రెండవ అభిప్రాయం తీసుకోండి లేదా చిత్రాన్ని మళ్ళీ పట్టుకోండి.`
                : `మేము ఫలితంపై సందేహం ఉన్నాము కానీ మేము ${response.prediction} అని అనుకుంటున్నాము. స్పష్టమైన చిత్రం అప్లోడ్ చేయడానికి ప్రయత్నించండి లేదా నిపుణుడి నుండి సలహా తీసుకోండి.`;
            response.suggestions = suggestions["Early Blight"][language];
            break;
          case "Late Blight":
            response.prediction = "వాయిదా బ్లైట్";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `మేము ఇది ${response.prediction} అని నమ్ముతున్నాము.`
                : response.confidence >= 50
                ? `మేము ఇది ${response.prediction} కావచ్చు అని అనుకుంటున్నాము, కానీ రెండవ అభిప్రాయం తీసుకోండి లేదా చిత్రాన్ని మళ్ళీ పట్టుకోండి.`
                : `మేము ఫలితంపై సందేహం ఉన్నాము కానీ మేము ${response.prediction} అని అనుకుంటున్నాము. స్పష్టమైన చిత్రం అప్లోడ్ చేయడానికి ప్రయత్నించండి లేదా నిపుణుడి నుండి సలహా తీసుకోండి.`;
            response.suggestions = suggestions["Late Blight"][language];
            break;
          case "Healthy":
            response.prediction = "ఆరోగ్యవంతమైనది";
            response.confidence = response.confidence * 100;
            response.interpretation =
              response.confidence >= 80
                ? `మేము ఇది ${response.prediction} అని నమ్ముతున్నాము.`
                : response.confidence >= 50
                ? `మేము ఇది ${response.prediction} కావచ్చు అని అనుకుంటున్నాము, కానీ రెండవ అభిప్రాయం తీసుకోండి లేదా చిత్రాన్ని మళ్ళీ పట్టుకోండి.`
                : `మేము ఫలితంపై సందేహం ఉన్నాము కానీ మేము ${response.prediction} అని అనుకుంటున్నాము. స్పష్టమైన చిత్రం అప్లోడ్ చేయడానికి ప్రయత్నించండి లేదా నిపుణుడి నుండి సలహా తీసుకోండి.`;
            response.suggestions = suggestions["Healthy"][language];
            break;
          default:
            response.prediction = "అజ్ఞాత స్థితి";
            response.confidence = 0;
            response.interpretation =
              response.confidence >= 80
                ? `మేము ఇది ${response.prediction} అని నమ్ముతున్నాము.`
                : response.confidence >= 50
                ? `మేము ఇది ${response.prediction} కావచ్చు అని అనుకుంటున్నాము, కానీ రెండవ అభిప్రాయం తీసుకోండి లేదా చిత్రాన్ని మళ్ళీ పట్టుకోండి.`
                : `మేము ఫలితంపై సందేహం ఉన్నాము కానీ మేము ${response.prediction} అని అనుకుంటున్నాము. స్పష్టమైన చిత్రం అప్లోడ్ చేయడానికి ప్రయత్నించండి లేదా నిపుణుడి నుండి సలహా తీసుకోండి.`;
            response.suggestions = suggestions["Healthy"][language];
            break;
        }
        break;
    }

    const newPrediction = new Prediction({
      user: user._id,
      image: image,
      prediction: prediction.class,
      confidence: prediction.confidence,
    });
    await newPrediction.save();
    console.log(response);
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in prediction:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
