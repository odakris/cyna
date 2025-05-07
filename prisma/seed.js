import {
  OrderStatus,
  PrismaClient,
  // Role,
  SubscriptionType,
} from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

const prisma = new PrismaClient()

import bcrypt from "bcrypt"

// Fonction utilitaire pour générer des dates récentes
const getRecentDate = daysAgo => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

async function main() {
  try {
    console.log("Début de la procédure de seeding...")

    // Création des catégories
    console.log("Création des catégories...")
    const prevention = await prisma.category.create({
      data: {
        name: "Prévention",
        description:
          "Notre gamme de services de prévention est conçue pour anticiper et minimiser les risques cyber avant qu'ils ne se matérialisent. Elle comprend des évaluations approfondies de votre infrastructure numérique, des tests d'intrusion réguliers, ainsi que des formations de sensibilisation pour vos collaborateurs. Ces mesures proactives vous permettent d'identifier vos vulnérabilités, de corriger les failles potentielles et de développer une culture de vigilance au sein de votre organisation. Investir dans la prévention, c'est réduire considérablement le risque d'incidents coûteux et protéger votre réputation sur le long terme.",
        image:
          "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2070",
        priority_order: 1,
        active: true,
        updated_at: new Date(),
        created_at: new Date(),
      },
    })

    const protection = await prisma.category.create({
      data: {
        name: "Protection",
        description:
          "Nos solutions de protection constituent votre ligne de défense active contre les cybermenaces en constante évolution. Cette catégorie regroupe nos technologies de surveillance continue, de détection des intrusions et de blocage automatisé des menaces. Grâce à nos outils SOC, EDR et XDR de pointe, nous offrons une protection en temps réel qui s'adapte aux tactiques toujours plus sophistiquées des cybercriminels. Notre approche multicouche garantit une défense robuste de vos systèmes, réseaux et données critiques, permettant à votre entreprise de maintenir ses opérations en toute sécurité face aux menaces persistantes et aux attaques ciblées.",
        image:
          "https://images.unsplash.com/photo-1614064642639-e398cf05badb?q=80&w=2070",
        priority_order: 2,
        active: true,
        updated_at: new Date(),
        created_at: new Date(),
      },
    })

    const reponse = await prisma.category.create({
      data: {
        name: "Réponse",
        description:
          "Lorsqu'un incident de sécurité se produit malgré les mesures préventives, notre catégorie de services de réponse entre en action. Nous proposons une intervention rapide et méthodique pour contenir les menaces, éradiquer les malwares, et rétablir vos systèmes avec un minimum d'impact sur votre activité. Notre équipe d'experts en forensique numérique analyse l'étendue de la compromission, identifie les vecteurs d'attaque et vous accompagne dans la remédiation complète. Nous assurons également la coordination avec les autorités réglementaires si nécessaire et vous aidons à tirer les enseignements de l'incident pour renforcer votre posture de sécurité globale et éviter toute récidive.",
        image:
          "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=2074",
        priority_order: 3,
        active: true,
        updated_at: new Date(),
        created_at: new Date(),
      },
    })

    // Création des produits
    console.log("Création des produits...")
    const diagnosticCyber = await prisma.product.create({
      data: {
        name: "Diagnostic Cyber",
        description:
          "Notre solution de diagnostic cyber offre une évaluation complète et approfondie de votre infrastructure informatique et de vos pratiques de sécurité. Ce service identifie méthodiquement les vulnérabilités potentielles, analyse votre posture de sécurité actuelle et évalue votre conformité aux normes de l'industrie. Au terme de cette analyse, vous recevrez un rapport détaillé incluant une cartographie précise des risques ainsi que des recommandations personnalisées pour renforcer vos défenses.",
        technical_specs:
          "• Audit complet des infrastructures IT et OT\n• Analyse approfondie des vulnérabilités techniques et organisationnelles\n• Evaluation des politiques de sécurité existantes\n• Tests de pénétration ciblés sur vos actifs critiques\n• Cartographie détaillée des risques avec indices de criticité\n• Plan d'action priorisé avec recommandations concrètes\n• Présentation des résultats par nos experts certifiés\n• Rapport exécutif pour la direction et rapport technique détaillé\n• Conformité aux standards ISO 27001, NIST et RGPD",
        unit_price: 4500,
        discount_price: 4200,
        available: true,
        priority_order: 1,
        main_image:
          "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        stock: Math.floor(Math.random() * 10) + 10, // Stock plus élevé
        id_category: prevention.id_category,
        active: true,
      },
    })

    const testIntrusion = await prisma.product.create({
      data: {
        name: "Test d'intrusion",
        description:
          "Notre service de test d'intrusion reproduit les techniques utilisées par de véritables attaquants pour évaluer la robustesse réelle de vos systèmes et applications. Nos experts en sécurité offensive mènent des attaques contrôlées et documentées pour identifier les failles exploitables dans votre environnement numérique. Ce processus rigoureux permet de détecter les vulnérabilités qui pourraient échapper aux outils automatisés standards, tout en évaluant l'efficacité de vos mécanismes de détection et de réponse face à une menace concrète.",
        technical_specs:
          "• Tests d'intrusion black, grey et white box selon vos besoins\n• Expertise en hacking éthique certifiée (OSCP, CEH, CREST)\n• Méthodologie conforme aux standards OSSTMM et PTES\n• Tests ciblés sur applications web, API, réseaux, infrastructures cloud\n• Exploitation manuelle des vulnérabilités pour éviter les faux positifs\n• Analyse des vecteurs d'attaque complexes et des scénarios réalistes\n• Rapport détaillé incluant preuves d'exploitation et captures d'écran\n• Évaluation de la sévérité selon les métriques CVSS\n• Recommandations techniques précises pour chaque vulnérabilité identifiée",
        unit_price: 4000,
        discount_price: 3800,
        available: true,
        priority_order: 2,
        main_image:
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
        stock: Math.floor(Math.random() * 10) + 5,
        id_category: prevention.id_category,
        active: true,
      },
    })

    const formationCybersecurite = await prisma.product.create({
      data: {
        name: "Formation Cybersécurité",
        description:
          "Notre programme de formation en cybersécurité est conçu pour sensibiliser vos collaborateurs aux menaces numériques actuelles et renforcer votre première ligne de défense. Des sessions interactives et personnalisées transforment vos employés en acteurs proactifs de la sécurité informatique de votre entreprise. Ces formations combinent théorie et exercices pratiques pour garantir une rétention optimale des connaissances, avec des mises en situation réalistes adaptées à votre secteur d'activité et aux rôles spécifiques au sein de votre organisation.",
        technical_specs:
          "• Modules de formation adaptés à tous les niveaux (débutant à avancé)\n• Contenu personnalisé selon votre secteur d'activité et profil de risque\n• Plateforme e-learning accessible 24/7 avec suivi des progrès\n• Simulations de phishing personnalisées et campagnes de sensibilisation\n• Ateliers pratiques sur la sécurité des mots de passe et l'authentification\n• Formation sur la détection des tentatives d'ingénierie sociale\n• Mise à jour trimestrielle du contenu selon l'évolution des menaces\n• Tableau de bord d'analyse des performances et de progression\n• Certification des participants et rapports détaillés pour la direction",
        unit_price: 2500,
        discount_price: 2200,
        available: true,
        priority_order: 3,
        main_image:
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655",
        stock: Math.floor(Math.random() * 10) + 15,
        id_category: prevention.id_category,
        active: true,
      },
    })

    const auditRGPD = await prisma.product.create({
      data: {
        name: "Audit de conformité RGPD",
        description:
          "Notre audit de conformité RGPD offre une analyse exhaustive de vos pratiques de traitement des données personnelles pour garantir leur alignement avec la réglementation européenne. Nos experts juridiques et techniques examinent méticuleusement votre organisation pour identifier les écarts par rapport aux exigences légales et vous accompagnent dans la mise en place des mesures correctives nécessaires. Ce service complet vous permet non seulement d'éviter les sanctions financières considérables, mais également de transformer votre conformité en avantage concurrentiel en renforçant la confiance de vos clients et partenaires.",
        technical_specs:
          "• Cartographie complète des traitements de données personnelles\n• Évaluation des bases légales et des consentements\n• Analyse de la documentation (politiques, registres, contrats)\n• Revue des mesures techniques et organisationnelles\n• Évaluation des procédures de notification de violation\n• Vérification des transferts de données hors UE\n• Analyse des outils et processus de respect des droits des personnes\n• Accompagnement dans la désignation et formation du DPO\n• Rapport de non-conformités avec plan d'action correctif priorisé",
        unit_price: 3500,
        discount_price: 3200,
        available: true,
        priority_order: 4,
        main_image:
          "https://images.unsplash.com/photo-1577563908411-5077b6dc7624",
        stock: Math.floor(Math.random() * 10) + 8,
        id_category: prevention.id_category,
        active: true,
      },
    })

    const microSOC = await prisma.product.create({
      data: {
        name: "Micro SOC",
        description:
          "Notre solution Micro SOC offre une surveillance continue de votre environnement numérique, spécifiquement adaptée aux besoins des PME. Ce service détecte les menaces en temps réel en analysant les comportements suspects sur l'ensemble de votre infrastructure. Notre plateforme de surveillance intelligente combine technologies avancées et expertise humaine pour identifier les anomalies potentiellement dangereuses avant qu'elles ne compromettent vos systèmes. Grâce à notre interface intuitive, vous bénéficiez d'une visibilité complète sur votre posture de sécurité et recevez des alertes immédiatement exploitables.",
        technical_specs:
          "• Surveillance 24/7/365 de votre infrastructure IT\n• Collecte et analyse des logs système, réseau et applicatifs\n• Détection des menaces basée sur le machine learning et analyses comportementales\n• Corrélation des événements multi-sources pour éliminer les faux positifs\n• Plateforme SIEM optimisée pour les PME avec rétention des données pendant 12 mois\n• Tableaux de bord personnalisables et rapports de sécurité automatisés\n• Alertes contextualisées avec niveau de criticité et recommandations\n• Intégration avec plus de 200 sources de données et applications\n• Support technique réactif et accès à nos experts en cybersécurité",
        unit_price: 5000,
        discount_price: null,
        available: true,
        priority_order: 1,
        main_image: "https://images.unsplash.com/photo-1551434678-e076c223a692",
        stock: Math.floor(Math.random() * 10) + 8,
        id_category: protection.id_category,
        active: true,
      },
    })

    const socManage = await prisma.product.create({
      data: {
        name: "SOC Managé",
        description:
          "Notre service SOC Managé offre une solution complète de cybersécurité supervisée par des analystes experts opérant 24h/24, 7j/7. Cette approche proactive combine technologies de pointe et intelligence humaine pour une détection et une réponse rapides face aux cybermenaces. Notre équipe spécialisée surveille constamment votre environnement numérique, analyse les alertes, élimine les faux positifs et orchestre la réponse aux incidents. Vous bénéficiez ainsi d'une protection continue optimale sans avoir à constituer et former votre propre équipe de sécurité.",
        technical_specs:
          "• Centre d'opérations de sécurité opérationnel 24/7/365\n• Équipe d'analystes certifiés (CISSP, SANS GIAC, etc.)\n• Architecture SIEM/SOAR avec corrélation avancée et automatisation\n• Veille sur les menaces et intégration de renseignements cyber (CTI)\n• Détection d'anomalies par IA et analyses comportementales (UEBA)\n• Chasse proactive aux menaces (threat hunting)\n• Gestion des incidents avec procédures personnalisées\n• SLA garantissant des temps de réponse selon la criticité\n• Rapports détaillés hebdomadaires, mensuels et trimestriels\n• Portail client sécurisé pour suivi en temps réel",
        unit_price: 7000,
        discount_price: 6500,
        available: true,
        priority_order: 2,
        main_image:
          "https://images.pexels.com/photos/31862218/pexels-photo-31862218/free-photo-of-jeune-homme-dans-une-piece-sombre-travaillant-sur-la-configuration-d-un-ordinateur.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        stock: Math.floor(Math.random() * 10) + 5,
        id_category: protection.id_category,
        active: true,
      },
    })

    const edrSolution = await prisma.product.create({
      data: {
        name: "EDR - Endpoint Detection and Response",
        description:
          "Notre solution EDR (Endpoint Detection and Response) surveille en continu les postes de travail et serveurs de votre organisation pour détecter et neutraliser les menaces sophistiquées qui échappent aux antivirus traditionnels. Contrairement aux solutions classiques qui se contentent de bloquer des signatures connues, notre EDR analyse les comportements suspects en temps réel, détecte les anomalies et permet une réponse immédiate sur l'ensemble de votre parc informatique. La visibilité complète sur chaque terminal vous permet d'identifier rapidement l'origine et l'étendue des attaques potentielles.",
        technical_specs:
          "• Agents légers (< 1% d'impact sur les performances) pour Windows, macOS, Linux\n• Protection contre les malwares avancés, fileless attacks et zero-days\n• Analyse comportementale en temps réel basée sur l'IA et le machine learning\n• Détection des techniques d'attaque selon le framework MITRE ATT&CK\n• Isolation réseau et confinement instantané des terminaux compromis\n• Remédiation automatisée pour les menaces identifiées\n• Forensic avancé avec capture de la mémoire et collecte des artefacts\n• Console centralisée avec visualisation des chaînes d'attaque\n• Recherche de menaces sur l'historique des activités (90 jours minimum)\n• Intégration avec votre SOC ou notre service de SOC Managé",
        unit_price: 4800,
        discount_price: 4500,
        available: true,
        priority_order: 3,
        main_image:
          "https://images.unsplash.com/photo-1617802690658-1173a812650d",
        stock: Math.floor(Math.random() * 10) + 7,
        id_category: protection.id_category,
        active: true,
      },
    })

    const xdrPlatform = await prisma.product.create({
      data: {
        name: "XDR - Extended Detection and Response",
        description:
          "Notre plateforme XDR (Extended Detection and Response) représente l'évolution naturelle de la sécurité en unifiant la détection et la réponse à travers tous vos vecteurs d'attaque. En intégrant les données provenant des endpoints, du réseau, du cloud et des emails, notre XDR fournit une visibilité sans précédent sur l'ensemble de votre écosystème numérique. Cette approche holistique permet de détecter les attaques complexes qui traversent plusieurs systèmes et de coordonner une réponse cohérente à l'échelle de toute votre infrastructure.",
        technical_specs:
          "• Plateforme unifiée intégrant les données de multiples sources (endpoints, réseau, cloud, email)\n• Corrélation automatique des alertes entre différents vecteurs d'attaque\n• Réduction drastique des faux positifs grâce à l'analyse contextuelle\n• Détection des attaques multi-vecteurs invisibles aux solutions traditionnelles\n• Visualisation complète de la chaîne d'attaque avec timeline interactive\n• Response automatisée orchestrée sur l'ensemble de l'infrastructure\n• Analyses d'impact en temps réel pour priorisation des incidents\n• Threat hunting proactif avec requêtes personnalisables\n• 400+ règles de détection préconfigurées et mises à jour quotidiennement\n• Intégration native avec plus de 300 outils de sécurité tiers",
        unit_price: 8500,
        discount_price: 7900,
        available: true,
        priority_order: 4,
        main_image:
          "https://images.pexels.com/photos/5473956/pexels-photo-5473956.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        stock: Math.floor(Math.random() * 10) + 6,
        id_category: protection.id_category,
        active: true,
      },
    })

    const antiPhishing = await prisma.product.create({
      data: {
        name: "Protection Email & Anti-Phishing",
        description:
          "Notre solution de Protection Email & Anti-Phishing constitue votre ligne de défense contre la menace cybersécuritaire la plus répandue. En utilisant des technologies d'intelligence artificielle avancées, nous analysons chaque message entrant pour détecter les tentatives de phishing, les malwares, les usurpations d'identité et autres menaces sophistiquées. Notre plateforme bloque proactivement les emails malveillants avant qu'ils n'atteignent vos collaborateurs, tout en offrant des outils de sensibilisation pour renforcer la vigilance de vos équipes face aux attaques qui pourraient passer entre les mailles du filet.",
        technical_specs:
          "• Filtrage multi-couches des emails entrants et sortants\n• Analyse des pièces jointes par sandbox sécurisée\n• Protection contre les attaques de phishing, spear phishing et whaling\n• Détection des URL malveillantes avec analyse en temps réel au clic\n• Prévention des attaques d'ingénierie sociale et d'usurpation d'identité\n• Vérification DMARC, SPF et DKIM pour authentification des expéditeurs\n• Protection contre les emails de compromission (BEC)\n• Simulation de phishing personnalisée pour la formation des employés\n• Tableau de bord d'analyse des menaces avec rapports détaillés\n• Intégration avec Microsoft 365, Google Workspace et autres plateformes",
        unit_price: 3500,
        discount_price: 3000,
        available: true,
        priority_order: 5,
        main_image:
          "https://images.pexels.com/photos/211151/pexels-photo-211151.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        stock: Math.floor(Math.random() * 10) + 10,
        id_category: protection.id_category,
        active: true,
      },
    })

    const investigation = await prisma.product.create({
      data: {
        name: "Investigation, éradication, remédiation",
        description:
          "Notre service d'investigation, éradication et remédiation fournit une réponse complète et méthodique aux incidents de sécurité confirmés. Nos experts en forensique numérique interviennent rapidement pour analyser l'étendue de la compromission, isoler les systèmes affectés et éliminer toute présence malveillante de votre infrastructure. Au-delà de la simple résolution de l'incident, notre approche comprend une analyse approfondie des causes racines et la mise en œuvre de mesures correctives pour empêcher des attaques similaires à l'avenir, tout en minimisant l'impact sur vos opérations commerciales.",
        technical_specs:
          "• Équipe d'intervention disponible 24/7 avec délai de réponse garanti\n• Analyse forensique approfondie sur systèmes compromis\n• Identification de l'étendue complète de la compromission\n• Collecte et préservation des preuves selon les normes judiciaires\n• Isolation et confinement des systèmes affectés\n• Éradication des malwares et des persistances d'attaquants\n• Restauration sécurisée des systèmes et données\n• Analyse des indicateurs de compromission (IOC)\n• Identification des vecteurs d'attaque et des vulnérabilités exploitées\n• Rapport détaillé d'incident et recommandations pour renforcer vos défenses",
        unit_price: 8500,
        discount_price: 8000,
        available: true,
        priority_order: 1,
        main_image:
          "https://images.unsplash.com/photo-1633419461186-7d40a38105ec",
        stock: Math.floor(Math.random() * 10) + 3,
        id_category: reponse.id_category,
        active: true,
      },
    })

    const crisisManagement = await prisma.product.create({
      data: {
        name: "Gestion de crise cybersécurité",
        description:
          "Notre service de gestion de crise cybersécurité vous accompagne dans les moments les plus critiques suite à un incident majeur. Notre équipe pluridisciplinaire prend en charge la coordination globale de la réponse à l'incident, depuis la communication interne et externe jusqu'à l'interaction avec les autorités, en passant par la mise en œuvre des stratégies de continuité d'activité. Nous transformons une situation de crise potentiellement chaotique en un processus structuré et maîtrisé, minimisant les impacts financiers, opérationnels et réputationnels pour votre organisation.",
        technical_specs:
          "• Cellule de crise dédiée activable immédiatement 24/7\n• Experts en cybersécurité, communication et aspects juridiques\n• Plan de communication de crise personnalisé (interne/externe)\n• Coordination avec les autorités réglementaires (ANSSI, CNIL)\n• Gestion des relations médias et assistance communication publique\n• Pilotage des prestataires techniques et juridiques\n• Stratégies de continuité d'activité et plans de reprise\n• Documentation complète des actions pour exigences légales\n• Débriefing post-crise et analyse des retours d'expérience\n• Formation préventive de votre comité de direction à la gestion de crise cyber",
        unit_price: 9500,
        discount_price: 9000,
        available: true,
        priority_order: 2,
        main_image:
          "https://images.pexels.com/photos/5380655/pexels-photo-5380655.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        stock: Math.floor(Math.random() * 5) + 2,
        id_category: reponse.id_category,
        active: true,
      },
    })

    const cyberThreatIntelligence = await prisma.product.create({
      data: {
        name: "Cyber Threat Intelligence",
        description:
          "Notre service de Cyber Threat Intelligence (CTI) transforme le renseignement sur les menaces en avantage stratégique pour votre organisation. Plutôt que d'attendre d'être victime d'une attaque, notre équipe d'analystes surveille activement le paysage des menaces pour identifier celles qui ciblent spécifiquement votre secteur d'activité et votre entreprise. En fournissant des informations contextualisées et actionnables sur les tactiques, techniques et procédures (TTP) des attaquants, nous vous permettons d'anticiper les menaces et d'adapter proactivement vos défenses pour contrer les attaques avant qu'elles ne se matérialisent.",
        technical_specs:
          "• Veille personnalisée sur les menaces ciblant votre secteur d'activité\n• Surveillance du dark web et des forums cybercriminels\n• Analyse des campagnes d'attaques émergentes et des tendances\n• Profiling des acteurs malveillants susceptibles de vous cibler\n• Fourniture d'indicateurs de compromission (IOC) actualisés\n• Alertes précoces sur les vulnérabilités critiques exploitées\n• Rapports de renseignement stratégique pour la direction\n• Briefings tactiques pour les équipes techniques\n• Intégration des IOC dans vos solutions de sécurité\n• Accès à notre plateforme CTI avec tableau de bord personnalisé",
        unit_price: 6000,
        discount_price: 5500,
        available: true,
        priority_order: 3,
        main_image:
          "https://images.unsplash.com/photo-1585079374502-415f8516dcc3",
        stock: Math.floor(Math.random() * 10) + 4,
        id_category: reponse.id_category,
        active: true,
      },
    })

    const redTeam = await prisma.product.create({
      data: {
        name: "Red Team - Simulation d'attaques avancées",
        description:
          "Notre service Red Team reproduit les méthodes d'attaque des adversaires les plus sophistiqués pour évaluer l'efficacité réelle de vos défenses cybersécurité. Contrairement aux tests d'intrusion traditionnels limités à des cibles spécifiques, nos opérations Red Team sont des simulations complètes qui combinent ingénierie sociale, exploitation technique et mouvement latéral pour tester l'ensemble de votre posture de sécurité. Ces exercices permettent d'évaluer non seulement vos défenses techniques, mais aussi vos capacités de détection et de réponse face à des attaques ciblées, offrant ainsi une vision holistique de votre résilience cybersécurité.",
        technical_specs:
          "• Scénarios d'attaque personnalisés basés sur les menaces réelles de votre secteur\n• Simulations d'APT (Advanced Persistent Threats) sur plusieurs semaines\n• Techniques d'ingénierie sociale avancées (phishing, vishing, social engineering)\n• Exploitation de vulnérabilités techniques et organisationnelles\n• Mouvement latéral et élévation de privilèges dans votre réseau\n• Tests d'exfiltration de données sensibles\n• Évaluation de vos capacités de détection et de réponse\n• Débriefing complet avec démonstration des techniques utilisées\n• Rapport détaillant le déroulement complet de l'attaque simulée\n• Plan d'amélioration priorisé pour renforcer vos défenses",
        unit_price: 10000,
        discount_price: 9500,
        available: true,
        priority_order: 4,
        main_image:
          "https://images.pexels.com/photos/5380596/pexels-photo-5380596.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        stock: Math.floor(Math.random() * 5) + 2,
        id_category: reponse.id_category,
        active: true,
      },
    })

    // Création des images pour les produits
    console.log("Création des images pour les produits...")
    await prisma.productCarousselImage.createMany({
      data: [
        // Diagnostic Cyber
        {
          url: "https://images.pexels.com/photos/430208/pexels-photo-430208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "Diagnostic Cyber - Vue d'ensemble",
          id_product: diagnosticCyber.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1551808525-51a94da548ce",
          alt: "Tableau de bord principal du diagnostic cyber",
          id_product: diagnosticCyber.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1573164713988-8665fc963095",
          alt: "Interface d'analyse des vulnérabilités",
          id_product: diagnosticCyber.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd",
          alt: "Rapport de diagnostic et cartographie des risques",
          id_product: diagnosticCyber.id_product,
        },

        // Test d'intrusion
        {
          url: "https://images.unsplash.com/photo-1548092372-0d1bd40894a3",
          alt: "Test d'intrusion - Vue d'ensemble",
          id_product: testIntrusion.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a",
          alt: "Console de pentesting en action",
          id_product: testIntrusion.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3",
          alt: "Analyse des vulnérabilités découvertes",
          id_product: testIntrusion.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe",
          alt: "Rapport détaillé des failles identifiées",
          id_product: testIntrusion.id_product,
        },

        // Formation Cybersécurité
        {
          url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
          alt: "Formation Cybersécurité - Vue d'ensemble",
          id_product: formationCybersecurite.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
          alt: "Plateforme de formation en ligne",
          id_product: formationCybersecurite.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0",
          alt: "Session de formation pratique",
          id_product: formationCybersecurite.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1531482615713-2afd69097998",
          alt: "Simulation de phishing pour formation",
          id_product: formationCybersecurite.id_product,
        },

        // Audit RGPD
        {
          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
          alt: "Audit RGPD - Vue d'ensemble",
          id_product: auditRGPD.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6",
          alt: "Interface d'analyse de conformité RGPD",
          id_product: auditRGPD.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d",
          alt: "Cartographie des traitements de données",
          id_product: auditRGPD.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
          alt: "Plan d'action correctif RGPD",
          id_product: auditRGPD.id_product,
        },

        // Micro SOC
        {
          url: "https://images.unsplash.com/photo-1489875347897-49f64b51c1f8",
          alt: "Micro SOC - Vue d'ensemble",
          id_product: microSOC.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f",
          alt: "Tableau de bord du Centre d'Opérations de Sécurité",
          id_product: microSOC.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
          alt: "Interface de monitoring temps réel",
          id_product: microSOC.id_product,
        },
        {
          url: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "Analyse des logs et alertes de sécurité",
          id_product: microSOC.id_product,
        },

        // SOC Managé
        {
          url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
          alt: "SOC Managé - Vue d'ensemble",
          id_product: socManage.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9",
          alt: "Centre d'opérations de sécurité 24/7",
          id_product: socManage.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
          alt: "Tableau de bord avancé de monitoring",
          id_product: socManage.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1555099962-4199c345e5dd",
          alt: "Analyse des menaces en temps réel",
          id_product: socManage.id_product,
        },

        // EDR Solution
        {
          url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
          alt: "EDR - Vue d'ensemble",
          id_product: edrSolution.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1562813733-b31f71025d54",
          alt: "Tableau de bord de détection des menaces sur endpoints",
          id_product: edrSolution.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1610018556010-6a11691bc905",
          alt: "Interface d'analyse comportementale en temps réel",
          id_product: edrSolution.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1579403124614-197f69d8187b",
          alt: "Visualisation de la chaîne d'attaque sur endpoint",
          id_product: edrSolution.id_product,
        },

        // XDR Platform
        {
          url: "https://images.pexels.com/photos/5380607/pexels-photo-5380607.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "XDR - Vue d'ensemble",
          id_product: xdrPlatform.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
          alt: "Plateforme unifiée d'analyse multi-vecteur",
          id_product: xdrPlatform.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
          alt: "Visualisation avancée des menaces corrélées",
          id_product: xdrPlatform.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1478826160983-e6db8c7d537a",
          alt: "Interface de réponse orchestrée aux incidents",
          id_product: xdrPlatform.id_product,
        },

        // Anti-Phishing
        {
          url: "https://images.pexels.com/photos/6963098/pexels-photo-6963098.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "Protection Email & Anti-Phishing - Vue d'ensemble",
          id_product: antiPhishing.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2",
          alt: "Interface de filtrage des emails malveillants",
          id_product: antiPhishing.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1526374870839-e155464bb9b2",
          alt: "Tableau de bord des tentatives de phishing bloquées",
          id_product: antiPhishing.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
          alt: "Plateforme de simulation et sensibilisation au phishing",
          id_product: antiPhishing.id_product,
        },

        // Investigation
        {
          url: "https://images.pexels.com/photos/5475750/pexels-photo-5475750.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "Investigation, éradication, remédiation - Vue d'ensemble",
          id_product: investigation.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1609743522653-52354461eb27",
          alt: "Interface d'analyse forensique numérique",
          id_product: investigation.id_product,
        },
        {
          url: "https://images.pexels.com/photos/5935791/pexels-photo-5935791.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "Visualisation des indicateurs de compromission",
          id_product: investigation.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1579621970795-87facc2f976d",
          alt: "Tableau de bord de remédiation des menaces",
          id_product: investigation.id_product,
        },

        // Crisis Management
        {
          url: "https://images.unsplash.com/photo-1542744095-291d1f67b221",
          alt: "Gestion de crise cybersécurité - Vue d'ensemble",
          id_product: crisisManagement.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
          alt: "Interface de coordination de crise",
          id_product: crisisManagement.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1",
          alt: "Tableau de bord de communication en situation de crise",
          id_product: crisisManagement.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7",
          alt: "Plan de continuité d'activité post-incident",
          id_product: crisisManagement.id_product,
        },

        // Cyber Threat Intelligence
        {
          url: "https://images.pexels.com/photos/3260626/pexels-photo-3260626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "Cyber Threat Intelligence - Vue d'ensemble",
          id_product: cyberThreatIntelligence.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1553877522-43269d4ea984",
          alt: "Plateforme d'analyse des menaces",
          id_product: cyberThreatIntelligence.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1489875347897-49f64b51c1f8",
          alt: "Dashboard de veille sur les menaces émergentes",
          id_product: cyberThreatIntelligence.id_product,
        },
        {
          url: "https://images.pexels.com/photos/1933900/pexels-photo-1933900.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "Visualisation des acteurs de menace par secteur",
          id_product: cyberThreatIntelligence.id_product,
        },

        // Red Team
        {
          url: "https://images.unsplash.com/photo-1573511860302-28c524319d2a",
          alt: "Red Team - Simulation d'attaques avancées - Vue d'ensemble",
          id_product: redTeam.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1504270997636-07ddfbd48945",
          alt: "Interface de planification d'opérations Red Team",
          id_product: redTeam.id_product,
        },
        {
          url: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107",
          alt: "Tableau de bord de simulation d'attaque en cours",
          id_product: redTeam.id_product,
        },
        {
          url: "https://images.pexels.com/photos/8720589/pexels-photo-8720589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "Rapport d'analyse post-simulation d'attaque",
          id_product: redTeam.id_product,
        },
      ],
    })

    // *** AJOUT : Création des slides du Hero Carousel ***
    console.log("Création des slides pour le Hero Carousel...")
    await prisma.heroCarouselSlide.createMany({
      data: [
        {
          title: "Solutions de cybersécurité pour les entreprises",
          description:
            "Des services de pointe pour protéger vos actifs numériques et garantir la continuité de votre activité",
          image_url:
            "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1920",
          button_text: "Découvrir nos solutions",
          button_link: "/categories",
          active: true,
          priority_order: 1,
        },
        {
          title: "Tests d'intrusion et audit de sécurité",
          description:
            "Identifiez vos vulnérabilités avant que les hackers ne le fassent",
          image_url:
            "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1920",
          button_text: "En savoir plus",
          button_link: "/produit/2",
          active: true,
          priority_order: 2,
        },
        {
          title: "Nouveau : SOC Managé 24/7",
          description:
            "Surveillance continue et réponse immédiate aux menaces pour une protection optimale",
          image_url:
            "https://images.pexels.com/photos/2061168/pexels-photo-2061168.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          button_text: "Découvrir le service",
          button_link: "/produit/4",
          active: true,
          priority_order: 3,
        },
        {
          title: "Offre spéciale 2025 : -10% sur nos diagnostics",
          description:
            "Profitez de notre offre spéciale jusqu'à la fin du mois d'avril",
          image_url:
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1920",
          button_text: "Profiter de l'offre",
          button_link: "/produit/1",
          active: true,
          priority_order: 4,
        },
        {
          title: "Services de remédiation après incident",
          description:
            "Retrouvez la sérénité après une cyberattaque grâce à nos experts",
          image_url:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1920",
          button_text: "Nos services de réponse",
          button_link: "/produit/5",
          active: true,
          priority_order: 5,
        },
      ],
    })

    // Création des utilisateurs
    console.log("Création des utilisateurs...")
    const salt = await bcrypt.genSalt(10)
    // const hashedPassword = await bcrypt.hash("Password123!", salt)
    // const adminPassword = await bcrypt.hash("AdminSecure456!", salt)

    // *** AJOUT : Création d'un utilisateur SUPER_ADMIN ***
    const superAdmin = await prisma.user.create({
      data: {
        first_name: "Super",
        last_name: "Admin",
        email: "superadmin@cyna.fr",
        password: await bcrypt.hash("superAdminPassword", salt),
        role: "SUPER_ADMIN", // Rôle SUPER_ADMIN
        email_verified: true,
        active: true,
        stripeCustomerId: "cus_super_admin",
      },
    })

    const admin = await prisma.user.create({
      data: {
        first_name: "Admin",
        last_name: "Système",
        email: "admin@cyna.fr",
        password: await bcrypt.hash("adminPassword", salt),
        role: "ADMIN",
        email_verified: true,
        active: true,
        stripeCustomerId: "cus_admin",
      },
    })

    // *** AJOUT : Création de plus d'utilisateurs ***
    const manager1 = await prisma.user.create({
      data: {
        first_name: "Philippe",
        last_name: "Dubois",
        email: "philippe.dubois@cyna.fr",
        password: await bcrypt.hash("hashedPassword", salt),
        role: "MANAGER",
        email_verified: true,
        active: true,
        stripeCustomerId: "cus_manager1",
      },
    })

    const manager2 = await prisma.user.create({
      data: {
        first_name: "Sophie",
        last_name: "Moreau",
        email: "sophie.moreau@cyna.fr",
        password: await bcrypt.hash("hashedPassword", salt),
        role: "MANAGER",
        email_verified: true,
        active: true,
        stripeCustomerId: "cus_manager2",
      },
    })

    const customer1 = await prisma.user.create({
      data: {
        first_name: "Jean",
        last_name: "Dupont",
        email: "jean.dupont@example.com",
        password: await bcrypt.hash("hashedPassword", salt),
        role: "CUSTOMER",
        email_verified: true,
        active: true,
        stripeCustomerId: "cus_customer1",
      },
    })

    const customer2 = await prisma.user.create({
      data: {
        first_name: "Marie",
        last_name: "Martin",
        email: "marie.martin@example.com",
        password: await bcrypt.hash("hashedPassword", salt),
        role: "CUSTOMER",
        email_verified: true,
        active: true,
        stripeCustomerId: "cus_customer2",
      },
    })

    const customer3 = await prisma.user.create({
      data: {
        first_name: "Thomas",
        last_name: "Bernard",
        email: "thomas.bernard@example.com",
        password: await bcrypt.hash("hashedPassword", salt),
        role: "CUSTOMER",
        email_verified: true,
        active: true,
        stripeCustomerId: "cus_customer3",
      },
    })

    const customer4 = await prisma.user.create({
      data: {
        first_name: "Émilie",
        last_name: "Leroy",
        email: "emilie.leroy@example.com",
        password: await bcrypt.hash("hashedPassword", salt),
        role: "CUSTOMER",
        email_verified: false, // Email non vérifié
        active: true,
        verify_token: "verify_emilie_token_123",
        stripeCustomerId: "cus_customer4",
      },
    })

    // Nouveaux clients pour les commandes récentes
    const customer5 = await prisma.user.create({
      data: {
        first_name: "Alexandre",
        last_name: "Petit",
        email: "alexandre.petit@example.com",
        password: await bcrypt.hash("hashedPassword", salt),
        role: "CUSTOMER",
        email_verified: true,
        active: true,
        stripeCustomerId: "cus_customer5",
      },
    })

    const customer6 = await prisma.user.create({
      data: {
        first_name: "Caroline",
        last_name: "Durand",
        email: "caroline.durand@example.com",
        password: await bcrypt.hash("hashedPassword", salt),
        role: "CUSTOMER",
        email_verified: true,
        active: true,
        stripeCustomerId: "cus_customer6",
      },
    })

    const customer7 = await prisma.user.create({
      data: {
        first_name: "Stéphane",
        last_name: "Moreau",
        email: "stephane.moreau@example.com",
        password: await bcrypt.hash("hashedPassword", salt),
        role: "CUSTOMER",
        email_verified: true,
        active: true,
        stripeCustomerId: "cus_customer7",
      },
    })

    // Création des adresses
    console.log("Création des adresses...")
    const address1 = await prisma.address.create({
      data: {
        first_name: "Jean",
        last_name: "Dupont",
        address1: "123 Rue de la Paix",
        address2: "Appartement 4B",
        postal_code: "75001",
        city: "Paris",
        region: "Île-de-France",
        country: "France",
        mobile_phone: "06 12 34 56 78",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer1.id_user,
      },
    })

    const address2 = await prisma.address.create({
      data: {
        first_name: "Marie",
        last_name: "Martin",
        address1: "456 Avenue Victor Hugo",
        postal_code: "69002",
        city: "Lyon",
        region: "Auvergne-Rhône-Alpes",
        country: "France",
        mobile_phone: "06 98 76 54 32",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer2.id_user,
      },
    })

    // *** AJOUT : Plus d'adresses pour les nouveaux utilisateurs ***
    const address3 = await prisma.address.create({
      data: {
        first_name: "Thomas",
        last_name: "Bernard",
        address1: "789 Boulevard Saint-Michel",
        postal_code: "44000",
        city: "Nantes",
        region: "Pays de la Loire",
        country: "France",
        mobile_phone: "07 11 22 33 44",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer3.id_user,
      },
    })

    const address4 = await prisma.address.create({
      data: {
        first_name: "Émilie",
        last_name: "Leroy",
        address1: "24 Rue des Lilas",
        postal_code: "33000",
        city: "Bordeaux",
        region: "Nouvelle-Aquitaine",
        country: "France",
        mobile_phone: "06 55 66 77 88",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer4.id_user,
      },
    })

    // Adresses pour les nouveaux clients
    const address5 = await prisma.address.create({
      data: {
        first_name: "Alexandre",
        last_name: "Petit",
        address1: "15 Rue du Commerce",
        postal_code: "13001",
        city: "Marseille",
        region: "Provence-Alpes-Côte d'Azur",
        country: "France",
        mobile_phone: "07 89 01 23 45",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer5.id_user,
      },
    })

    const address6 = await prisma.address.create({
      data: {
        first_name: "Caroline",
        last_name: "Durand",
        address1: "78 Avenue des Fleurs",
        postal_code: "59000",
        city: "Lille",
        region: "Hauts-de-France",
        country: "France",
        mobile_phone: "06 12 34 56 78",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer6.id_user,
      },
    })

    const address7 = await prisma.address.create({
      data: {
        first_name: "Stéphane",
        last_name: "Moreau",
        address1: "42 Rue de la République",
        postal_code: "67000",
        city: "Strasbourg",
        region: "Grand Est",
        country: "France",
        mobile_phone: "07 65 43 21 09",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer7.id_user,
      },
    })

    // Création des sessions
    console.log("Création des sessions...")
    const session1 = await prisma.session.create({
      data: {
        session_token: "sess_12345abcde",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        id_user: customer1.id_user,
      },
    })

    const session2 = await prisma.session.create({
      data: {
        session_token: "sess_67890fghij",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        id_user: customer2.id_user,
      },
    })

    // *** AJOUT : Plus de sessions ***
    const session3 = await prisma.session.create({
      data: {
        session_token: "sess_abcde12345",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        id_user: customer3.id_user,
      },
    })

    const sessionAdmin = await prisma.session.create({
      data: {
        session_token: "sess_admin54321",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        id_user: admin.id_user,
      },
    })

    const sessionSuperAdmin = await prisma.session.create({
      data: {
        session_token: "sess_super98765",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        id_user: superAdmin.id_user,
      },
    })

    // Sessions pour les nouveaux clients
    const session5 = await prisma.session.create({
      data: {
        session_token: "sess_alex12345",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        id_user: customer5.id_user,
      },
    })

    const session6 = await prisma.session.create({
      data: {
        session_token: "sess_carol67890",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        id_user: customer6.id_user,
      },
    })

    const session7 = await prisma.session.create({
      data: {
        session_token: "sess_steph13579",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        id_user: customer7.id_user,
      },
    })

    // Création des éléments du panier
    console.log("Création des éléments du panier...")
    await prisma.cartItem.create({
      data: {
        quantity: 1,
        subscription_type: SubscriptionType.YEARLY,
        id_product: diagnosticCyber.id_product,
        sessionId_session: session2.id_session,
      },
    })

    await prisma.cartItem.create({
      data: {
        quantity: 2,
        subscription_type: SubscriptionType.MONTHLY,
        id_product: testIntrusion.id_product,
        sessionId_session: session2.id_session,
      },
    })

    // *** AJOUT : Plus d'éléments de panier ***
    await prisma.cartItem.create({
      data: {
        quantity: 1,
        subscription_type: SubscriptionType.YEARLY,
        id_product: socManage.id_product,
        sessionId_session: session3.id_session,
      },
    })

    await prisma.cartItem.create({
      data: {
        quantity: 1,
        subscription_type: SubscriptionType.MONTHLY,
        id_product: investigation.id_product,
        userId_user: customer4.id_user, // Panier associé à l'utilisateur directement
      },
    })

    // Création des informations de paiement - STRUCTURE MISE À JOUR
    console.log("Création des informations de paiement...")

    await prisma.paymentInfo.create({
      data: {
        card_name: "Jean Dupont",
        brand: "visa",
        last_card_digits: "4242",
        stripe_payment_id: "pm_visa_4242",
        exp_month: 12, // Mois d'expiration
        exp_year: 2026, // Année d'expiration
        is_default: true,
        id_user: customer1.id_user,
        stripe_customer_id: customer1.stripeCustomerId, // Ajout du stripe_customer_id
      },
    })

    await prisma.paymentInfo.create({
      data: {
        card_name: "Marie Martin",
        brand: "visa",
        last_card_digits: "4444",
        stripe_payment_id: "pm_visa_4444",
        exp_month: 11, // Mois d'expiration
        exp_year: 2025, // Année d'expiration
        is_default: true,
        id_user: customer2.id_user,
        stripe_customer_id: customer2.stripeCustomerId, // Ajout du stripe_customer_id
      },
    })

    // *** AJOUT : Plus d'informations de paiement ***
    await prisma.paymentInfo.create({
      data: {
        card_name: "Thomas Bernard",
        brand: "mastercard",
        last_card_digits: "5555",
        stripe_payment_id: "pm_mastercard_5555",
        exp_month: 6, // Mois d'expiration
        exp_year: 2027, // Année d'expiration
        is_default: true,
        id_user: customer3.id_user,
        stripe_customer_id: customer3.stripeCustomerId, // Ajout du stripe_customer_id
      },
    })

    await prisma.paymentInfo.create({
      data: {
        card_name: "Jean Dupont Pro",
        brand: "amex",
        last_card_digits: "9876",
        stripe_payment_id: "pm_amex_9876",
        exp_month: 9, // Mois d'expiration
        exp_year: 2024, // Année d'expiration
        is_default: false,
        id_user: customer1.id_user,
        stripe_customer_id: customer1.stripeCustomerId, // Ajout du stripe_customer_id
      },
    })

    // Informations de paiement pour les nouveaux clients
    await prisma.paymentInfo.create({
      data: {
        card_name: "Alexandre Petit",
        brand: "visa",
        last_card_digits: "1234",
        stripe_payment_id: "pm_visa_1234",
        exp_month: 1, // Mois d'expiration
        exp_year: 2026, // Année d'expiration
        is_default: true,
        id_user: customer5.id_user,
        stripe_customer_id: customer5.stripeCustomerId, // Ajout du stripe_customer_id
      },
    })

    await prisma.paymentInfo.create({
      data: {
        card_name: "Caroline Durand",
        brand: "mastercard",
        last_card_digits: "5678",
        stripe_payment_id: "pm_mastercard_5678",
        exp_month: 3, // Mois d'expiration
        exp_year: 2025, // Année d'expiration
        is_default: true,
        id_user: customer6.id_user,
        stripe_customer_id: customer6.stripeCustomerId, // Ajout du stripe_customer_id
      },
    })

    await prisma.paymentInfo.create({
      data: {
        card_name: "Stéphane Moreau",
        brand: "visa",
        last_card_digits: "9012",
        stripe_payment_id: "pm_visa_9012",
        exp_month: 7, // Mois d'expiration
        exp_year: 2028, // Année d'expiration
        is_default: true,
        id_user: customer7.id_user,
        stripe_customer_id: customer7.stripeCustomerId, // Ajout du stripe_customer_id
      },
    })

    // Création des commandes historiques (conserver celles existantes)

    // ----- Commande 1 - Jean Dupont - Diagnostic Cyber (Abonnement annuel) -----
    const orderItems1 = [
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-06-15"),
        quantity: 1,
        unit_price: diagnosticCyber.unit_price, // 4500
        id_product: diagnosticCyber.id_product,
      },
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-06-15"),
        quantity: 1,
        unit_price: formationCybersecurite.unit_price, // 2500
        id_product: formationCybersecurite.id_product,
      },
    ]

    // Calcul précis du total
    const total1 = orderItems1.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    const order1 = await prisma.order.create({
      data: {
        order_date: new Date("2023-06-15"),
        total_amount: total1,
        subtotal: total1,
        order_status: OrderStatus.PROCESSING,
        payment_method: "CARD",
        last_card_digits: "4242",
        invoice_number: "INV-2023-001",
        invoice_pdf_url: "/invoices/INV-2023-001.pdf",
        id_user: customer1.id_user,
        id_address: address1.id_address,
      },
    })

    // Création des éléments de commande pour order1
    for (const item of orderItems1) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id_order: order1.id_order,
        },
      })
    }

    // ----- Commande 2 - Marie Martin - Investigation + Test d'intrusion (Abonnement annuel) -----
    const orderItems2 = [
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-07-22"),
        quantity: 1,
        unit_price: investigation.unit_price, // 8500
        id_product: investigation.id_product,
      },
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-07-22"),
        quantity: 1,
        unit_price: testIntrusion.discount_price || testIntrusion.unit_price, // 3800 (prix remisé)
        id_product: testIntrusion.id_product,
      },
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-07-22"),
        quantity: 1,
        unit_price:
          cyberThreatIntelligence.discount_price ||
          cyberThreatIntelligence.unit_price, // 5500
        id_product: cyberThreatIntelligence.id_product,
      },
    ]

    // Calcul précis du total
    const total2 = orderItems2.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    const order2 = await prisma.order.create({
      data: {
        order_date: new Date("2023-07-22"),
        total_amount: total2,
        subtotal: total2,
        order_status: OrderStatus.PROCESSING,
        payment_method: "CARD",
        last_card_digits: "4444",
        invoice_number: "INV-2023-002",
        invoice_pdf_url: "/invoices/INV-2023-002.pdf",
        id_user: customer2.id_user,
        id_address: address2.id_address,
      },
    })

    // Création des éléments de commande pour order2
    for (const item of orderItems2) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id_order: order2.id_order,
        },
      })
    }

    // ----- Commande 3 - Jean Dupont - SOC Managé (Mensuel) + EDR Solution (Annuel) -----
    const orderItems3 = [
      {
        subscription_type: SubscriptionType.MONTHLY,
        subscription_status: OrderStatus.PENDING,
        subscription_duration: 1,
        renewal_date: new Date("2023-10-05"),
        quantity: 1,
        unit_price: socManage.discount_price || socManage.unit_price, // 6500 (prix remisé)
        id_product: socManage.id_product,
      },
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.PENDING,
        subscription_duration: 12,
        renewal_date: new Date("2024-09-05"),
        quantity: 1,
        unit_price: edrSolution.discount_price || edrSolution.unit_price, // 4500 (prix remisé)
        id_product: edrSolution.id_product,
      },
    ]

    // Calcul précis du total
    const total3 = orderItems3.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    const order3 = await prisma.order.create({
      data: {
        order_date: new Date("2023-09-05"),
        total_amount: total3,
        subtotal: total3,
        order_status: OrderStatus.ACTIVE,
        payment_method: "CARD",
        last_card_digits: "4242",
        invoice_number: "INV-2023-003",
        id_user: customer1.id_user,
        id_address: address1.id_address,
      },
    })

    // Création des éléments de commande pour order3
    for (const item of orderItems3) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id_order: order3.id_order,
        },
      })
    }

    // ----- Commande 4 - Marie Martin - Protection Email & Anti-Phishing (Mensuel) avec quantité de 2 -----
    const orderItems4 = [
      {
        subscription_type: SubscriptionType.MONTHLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 1,
        renewal_date: new Date("2023-09-25"),
        quantity: 2, // Commander 2 licences mensuelles
        unit_price: antiPhishing.unit_price, // 3500 (prix normal)
        id_product: antiPhishing.id_product,
      },
    ]

    // Calcul précis du total (en prenant en compte la quantité)
    const total4 = orderItems4.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    const order4 = await prisma.order.create({
      data: {
        order_date: new Date("2023-08-25"),
        total_amount: total4,
        subtotal: total4,
        order_status: OrderStatus.COMPLETED,
        payment_method: "CARD",
        last_card_digits: "4444",
        invoice_number: "INV-2023-004",
        invoice_pdf_url: "/invoices/INV-2023-004.pdf",
        id_user: customer2.id_user,
        id_address: address2.id_address,
      },
    })

    // Création des éléments de commande pour order4
    for (const item of orderItems4) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id_order: order4.id_order,
        },
      })
    }

    // *** AJOUT : Commande supplémentaire pour Thomas Bernard - XDR Platform & Audit RGPD ***
    const orderItems5 = [
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-11-10"),
        quantity: 1,
        unit_price: xdrPlatform.discount_price || xdrPlatform.unit_price, // 7900 (prix remisé)
        id_product: xdrPlatform.id_product,
      },
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-11-10"),
        quantity: 1,
        unit_price: auditRGPD.unit_price, // 3500
        id_product: auditRGPD.id_product,
      },
    ]

    const total5 = orderItems5.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    const order5 = await prisma.order.create({
      data: {
        order_date: new Date("2023-11-10"),
        total_amount: total5,
        subtotal: total5,
        order_status: OrderStatus.ACTIVE,
        payment_method: "CARD",
        last_card_digits: "5555",
        invoice_number: "INV-2023-005",
        invoice_pdf_url: "/invoices/INV-2023-005.pdf",
        id_user: customer3.id_user,
        id_address: address3.id_address,
      },
    })

    for (const item of orderItems5) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id_order: order5.id_order,
        },
      })
    }

    // Ajout d'une commande pour la simulation d'attaques Red Team
    const orderItems6 = [
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-12-15"),
        quantity: 1,
        unit_price: redTeam.discount_price || redTeam.unit_price, // 9500 (prix remisé)
        id_product: redTeam.id_product,
      },
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-12-15"),
        quantity: 1,
        unit_price:
          crisisManagement.discount_price || crisisManagement.unit_price, // 9000 (prix remisé)
        id_product: crisisManagement.id_product,
      },
    ]

    const total6 = orderItems6.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    const order6 = await prisma.order.create({
      data: {
        order_date: new Date("2023-12-15"),
        total_amount: total6,
        subtotal: total6,
        order_status: OrderStatus.ACTIVE,
        payment_method: "CARD",
        last_card_digits: "1234",
        invoice_number: "INV-2023-006",
        invoice_pdf_url: "/invoices/INV-2023-006.pdf",
        id_user: customer5.id_user,
        id_address: address5.id_address,
      },
    })

    for (const item of orderItems6) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id_order: order6.id_order,
        },
      })
    }

    // Création des commandes récentes (pour le tableau de bord)
    console.log("Création des commandes récentes pour le tableau de bord...")

    // Fonction utilitaire pour créer une commande avec UUID
    async function createOrder(
      orderDate,
      user,
      address,
      items,
      status,
      cardDigits
    ) {
      // Génération du numéro de facture avec l'année actuelle, le mois et un UUID court
      const year = orderDate.getFullYear()
      const month = String(orderDate.getMonth() + 1).padStart(2, "0")

      // Utiliser un UUID court (8 premiers caractères) pour plus de lisibilité
      const shortUuid = uuidv4().split("-")[0]
      const invoiceNumber = `INV-${year}${month}-${shortUuid}`

      // Calcul du total
      const total = items.reduce(
        (acc, item) => acc + item.unit_price * item.quantity,
        0
      )

      // Création de la commande
      const order = await prisma.order.create({
        data: {
          order_date: orderDate,
          total_amount: total,
          subtotal: total,
          order_status: status,
          payment_method: "CARD",
          last_card_digits: cardDigits,
          invoice_number: invoiceNumber,
          invoice_pdf_url: `/invoices/${invoiceNumber}.pdf`,
          id_user: user.id_user,
          id_address: address.id_address,
        },
      })

      // Création des éléments de commande
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            ...item,
            id_order: order.id_order,
          },
        })
      }

      return order
    }

    // Mettre à jour la liste des produits pour inclure tous les nouveaux produits
    const allProducts = [
      diagnosticCyber,
      testIntrusion,
      formationCybersecurite,
      auditRGPD,
      microSOC,
      socManage,
      edrSolution,
      xdrPlatform,
      antiPhishing,
      investigation,
      crisisManagement,
      cyberThreatIntelligence,
      redTeam,
    ]

    // Créer des commandes pour les 7 derniers jours
    for (let i = 0; i < 7; i++) {
      // Jour actuel moins i jours
      const orderDate = getRecentDate(i)

      // Définir des utilisateurs différents pour chaque jour
      const users = [
        customer1,
        customer2,
        customer3,
        customer4,
        customer5,
        customer6,
        customer7,
      ]
      const addresses = [
        address1,
        address2,
        address3,
        address4,
        address5,
        address6,
        address7,
      ]
      const cardDigits = [
        "4242",
        "4444",
        "5555",
        "6666",
        "1234",
        "5678",
        "9012",
      ]

      // Nombre de commandes pour ce jour (entre 1 et 3)
      const numOrders = Math.floor(Math.random() * 3) + 1

      for (let j = 0; j < numOrders; j++) {
        // Sélectionner utilisateur et adresse aléatoires
        const userIndex = Math.floor(Math.random() * users.length)
        const user = users[userIndex]
        const address = addresses[userIndex]
        const cardDigit = cardDigits[userIndex]

        // Déterminer les produits pour cette commande (entre 1 et 3 produits)
        const numProducts = Math.floor(Math.random() * 3) + 1

        // Créer une copie du tableau de produits pour pouvoir en retirer sans affecter l'original
        const productPool = [...allProducts]
        const selectedProducts = []

        // Sélectionner des produits aléatoires sans duplication
        while (
          selectedProducts.length < numProducts &&
          productPool.length > 0
        ) {
          const randomIndex = Math.floor(Math.random() * productPool.length)
          selectedProducts.push(productPool.splice(randomIndex, 1)[0])
        }

        // Créer les éléments de commande
        const orderItems = selectedProducts.map(product => {
          const subscriptionTypes = [
            SubscriptionType.MONTHLY,
            SubscriptionType.YEARLY,
          ]
          const randomSubType =
            subscriptionTypes[
              Math.floor(Math.random() * subscriptionTypes.length)
            ]
          const duration = randomSubType === SubscriptionType.MONTHLY ? 1 : 12

          // Date de renouvellement
          const renewalDate = new Date(orderDate)
          renewalDate.setMonth(renewalDate.getMonth() + duration)

          // Quantité (1 ou 2)
          const quantity = Math.random() > 0.7 ? 2 : 1

          // Prix (normal ou remisé si disponible)
          const unitPrice = product.discount_price || product.unit_price

          return {
            subscription_type: randomSubType,
            subscription_status: OrderStatus.ACTIVE,
            subscription_duration: duration,
            renewal_date: renewalDate,
            quantity: quantity,
            unit_price: unitPrice,
            id_product: product.id_product,
          }
        })

        // Statut de la commande (le plus souvent ACTIVE, parfois PENDING ou COMPLETED)
        const statuses = [
          OrderStatus.ACTIVE,
          OrderStatus.ACTIVE,
          OrderStatus.ACTIVE,
          OrderStatus.PENDING,
          OrderStatus.COMPLETED,
        ]
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)]

        // Créer la commande
        await createOrder(
          orderDate,
          user,
          address,
          orderItems,
          randomStatus,
          cardDigit
        )
      }
    }

    // Créer des commandes pour les semaines précédentes (pour les 5 dernières semaines)
    for (let week = 1; week <= 4; week++) {
      // Pour chaque semaine, créer quelques commandes
      for (let day = 0; day < 3; day++) {
        // week semaines plus day jours en arrière
        const daysAgo = week * 7 + day
        const orderDate = getRecentDate(daysAgo)

        // Sélectionner utilisateur et adresse aléatoires
        const userIndex = Math.floor(Math.random() * 7)
        const users = [
          customer1,
          customer2,
          customer3,
          customer4,
          customer5,
          customer6,
          customer7,
        ]
        const addresses = [
          address1,
          address2,
          address3,
          address4,
          address5,
          address6,
          address7,
        ]
        const cardDigits = [
          "4242",
          "4444",
          "5555",
          "6666",
          "1234",
          "5678",
          "9012",
        ]

        const user = users[userIndex]
        const address = addresses[userIndex]
        const cardDigit = cardDigits[userIndex]

        // Nombre de produits (entre 1 et 2)
        const numProducts = Math.floor(Math.random() * 2) + 1

        // Créer une copie du tableau de produits pour pouvoir en retirer sans affecter l'original
        const productPool = [...allProducts]
        const selectedProducts = []

        // Sélectionner des produits aléatoires sans duplication
        while (
          selectedProducts.length < numProducts &&
          productPool.length > 0
        ) {
          const randomIndex = Math.floor(Math.random() * productPool.length)
          selectedProducts.push(productPool.splice(randomIndex, 1)[0])
        }

        // Créer les éléments de commande
        const orderItems = selectedProducts.map(product => {
          // Privilégier les abonnements annuels pour les anciennes commandes
          const subscriptionType =
            Math.random() > 0.3
              ? SubscriptionType.YEARLY
              : SubscriptionType.MONTHLY
          const duration =
            subscriptionType === SubscriptionType.MONTHLY ? 1 : 12

          // Date de renouvellement
          const renewalDate = new Date(orderDate)
          renewalDate.setMonth(renewalDate.getMonth() + duration)

          // Prix (normal ou remisé si disponible)
          const unitPrice = product.discount_price || product.unit_price

          return {
            subscription_type: subscriptionType,
            subscription_status: OrderStatus.ACTIVE,
            subscription_duration: duration,
            renewal_date: renewalDate,
            quantity: 1,
            unit_price: unitPrice,
            id_product: product.id_product,
          }
        })

        // La plupart des anciennes commandes sont ACTIVE ou COMPLETED
        const statuses = [OrderStatus.ACTIVE, OrderStatus.COMPLETED]
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)]

        // Créer la commande
        await createOrder(
          orderDate,
          user,
          address,
          orderItems,
          randomStatus,
          cardDigit
        )
      }
    }

    // Création des messages de contact
    console.log("Création des messages de contact...")
    await prisma.contactMessage.create({
      data: {
        first_name: "Jean",
        last_name: "Dupont",
        email: "jean.dupont@example.com",
        subject: "Question sur le diagnostic cyber",
        message:
          "Bonjour, je souhaite en savoir plus sur votre service de diagnostic cyber. Comment se déroule l'intervention dans nos locaux ? Merci d'avance pour votre réponse.",
        sent_date: new Date("2023-06-10"),
        is_read: true,
        is_responded: true,
        response:
          "Bonjour Jean, merci pour votre intérêt. Notre intervention se déroule en trois phases : audit initial, analyse des vulnérabilités et remise du rapport détaillé. Un consultant se déplacera dans vos locaux pour la première phase. N'hésitez pas si vous avez d'autres questions.",
        response_date: new Date("2023-06-12"),
        id_user: customer1.id_user,
      },
    })

    await prisma.contactMessage.create({
      data: {
        first_name: "Marie",
        last_name: "Martin",
        email: "marie.martin@example.com",
        subject: "Demande de devis personnalisé",
        message:
          "Bonjour, je dirige une PME de 25 employés dans le secteur financier. Pouvez-vous me proposer un devis personnalisé pour vos services de protection ? Cordialement, Marie Martin",
        sent_date: new Date("2023-07-18"),
        is_read: true,
        is_responded: false,
        id_user: customer2.id_user,
      },
    })

    await prisma.contactMessage.create({
      data: {
        first_name: "Michel",
        last_name: "Dupuis",
        email: "contact@entreprise-xyz.fr",
        subject: "Demande d'information",
        message:
          "Bonjour, je souhaite recevoir plus d'informations sur vos services de SOC managé. Pouvez-vous me contacter au 01 23 45 67 89 ? Merci.",
        sent_date: new Date(),
        is_read: false,
        is_responded: false,
      },
    })

    // Messages récents
    await prisma.contactMessage.create({
      data: {
        first_name: "Alexandre",
        last_name: "Petit",
        email: "alexandre.petit@example.com",
        subject: "Question technique sur le Micro SOC",
        message:
          "Bonjour, nous avons récemment souscrit à votre service Micro SOC et j'aimerais savoir comment accéder au tableau de bord de surveillance. Merci d'avance.",
        sent_date: getRecentDate(2),
        is_read: true,
        is_responded: true,
        response:
          "Bonjour Alexandre, merci pour votre message. Vous pouvez accéder au tableau de bord via l'URL suivante : dashboard.cyna.fr en utilisant les identifiants qui vous ont été envoyés par email. N'hésitez pas si vous avez d'autres questions.",
        response_date: getRecentDate(1),
        id_user: customer5.id_user,
      },
    })

    await prisma.contactMessage.create({
      data: {
        first_name: "Caroline",
        last_name: "Durand",
        email: "caroline.durand@example.com",
        subject: "Renouvellement de contrat",
        message:
          "Bonjour, notre contrat arrive à échéance le mois prochain. Pouvez-vous me contacter pour discuter des conditions de renouvellement ? Merci.",
        sent_date: getRecentDate(3),
        is_read: true,
        is_responded: false,
        id_user: customer6.id_user,
      },
    })

    // Création des tokens de réinitialisation de mot de passe
    console.log("Création des tokens de réinitialisation de mot de passe...")
    await prisma.passwordResetToken.create({
      data: {
        token: "reset_123456789",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 heures
        id_user: customer1.id_user,
      },
    })

    console.log("Création des messages principaux pour la page d'accueil...")
    await prisma.mainMessage.createMany({
      data: [
        {
          content:
            "Offres spéciales printemps 2025 : -15% sur tous nos services de protection jusqu'au 30 avril !",
          active: true,
          has_background: true,
          background_color: "bg-amber-100",
          text_color: "text-amber-800",
        },
        {
          content:
            "Découvrez notre nouveau service de SOC managé avec 15% de réduction pendant tout le mois",
          active: false,
          has_background: true,
          background_color: "bg-blue-100",
          text_color: "text-blue-800",
        },
        {
          content:
            "Important : Mise à jour de sécurité disponible pour tous nos clients",
          active: false,
          has_background: false,
          background_color: null,
          text_color: "text-red-600",
        },
      ],
    })

    console.log("Seeding terminé avec succès !")
  } catch (error) {
    console.error("Erreur durant le seeding :", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
