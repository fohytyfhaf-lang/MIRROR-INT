/* =========================================================
   OMEGA PERSONNEL AI
========================================================= */

const personnelAI = {

    "SECURITY_01": {
        personality: "calm",
        department: "security",

        knowledge: [
            "security",
            "sectors",
            "incidents"
        ]
    },

    "SECURITY_02": {
        personality: "serious",
        department: "security",

        knowledge: [
            "security",
            "incidents",
            "restricted"
        ]
    },

    "SECURITY_03": {
        personality: "suspicious",
        department: "security",

        knowledge: [
            "security",
            "surveillance",
            "restricted"
        ]
    },


    "DR. KLINE": {
        personality: "cold_scientist",
        department: "research",

        knowledge: [
            "research",
            "experiments",
            "TEN"
        ]
    },

    "DR. MILLER": {
        personality: "nervous_scientist",
        department: "research",

        knowledge: [
            "research",
            "experiments",
            "TEN"
        ]
    },


    "MEDICAL_02": {
        personality: "professional",
        department: "medical",

        knowledge: [
            "medical",
            "patients"
        ]
    },

    "MEDICAL_05": {
        personality: "worried",
        department: "medical",

        knowledge: [
            "medical",
            "patients",
            "incidents"
        ]
    },


    "ADMIN": {
        personality: "formal",
        department: "administration",

        knowledge: [
            "administration",
            "security",
            "research",
            "restricted"
        ]
    }

};


/* =========================================================
   GET PERSONNEL
========================================================= */

export function getPersonnelAI(name) {

    return personnelAI[name] || {

        personality: "normal",
        department: "unknown",
        knowledge: []

    };

}


/* =========================================================
   GENERATE RESPONSE
========================================================= */

export function generatePersonnelResponse(name, text) {

    const person =
        getPersonnelAI(name);

    const message =
        text.toLowerCase();


    /* =========================================
       SECURITY
    ========================================= */

    if (person.department === "security") {

        if (
            message.includes("incident") ||
            message.includes("инцидент")
        ) {

            return "The incident has been documented. Further details are restricted.";

        }

        if (
            message.includes("security") ||
            message.includes("безопасность")
        ) {

            return "Security systems are operational.";

        }

        if (
            message.includes("ten") ||
            message.includes("тен")
        ) {

            return "I don't have authorization to discuss that.";

        }

        if (
            message.includes("who") ||
            message.includes("кто")
        ) {

            return "Security personnel. That's all you need to know.";

        }

        return "Understood. I'll keep an eye on it.";
    }


    /* =========================================
       RESEARCH
    ========================================= */

    if (person.department === "research") {

        if (
            message.includes("ten") ||
            message.includes("тен")
        ) {

            if (person.personality === "nervous_scientist") {

                return "We shouldn't be discussing TEN here.";

            }

            return "TEN is an experimental subject.";
        }


        if (
            message.includes("experiment") ||
            message.includes("эксперимент")
        ) {

            return "The experiment is still under observation.";
        }


        if (
            message.includes("why") ||
            message.includes("почему")
        ) {

            return "Because the previous results were inconclusive.";
        }


        return "I'll need more specific information.";
    }


    /* =========================================
       MEDICAL
    ========================================= */

    if (person.department === "medical") {

        if (
            message.includes("patient") ||
            message.includes("пациент")
        ) {

            return "Patient information is confidential.";
        }


        if (
            message.includes("injury") ||
            message.includes("травм")
        ) {

            return "The medical sector is handling the situation.";
        }


        return "Medical records are not available through this channel.";
    }


    /* =========================================
       ADMINISTRATION
    ========================================= */

    if (person.department === "administration") {

        if (
            message.includes("access") ||
            message.includes("доступ")
        ) {

            return "Access is determined by your clearance level.";
        }


        if (
            message.includes("document") ||
            message.includes("документ")
        ) {

            return "Internal documents must not be redistributed.";
        }


        return "Please submit an official request.";
    }


    return "Understood.";
}
