-- CreateTable
CREATE TABLE `Categorie` (
    `id_categorie` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `image` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_categorie`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produit` (
    `id_produit` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `caracteristiques_techniques` VARCHAR(191) NULL,
    `prix_unitaire` DOUBLE NOT NULL,
    `disponible` BOOLEAN NOT NULL,
    `ordre_priorite` INTEGER NOT NULL,
    `date_maj` DATETIME(3) NOT NULL,
    `id_categorie` INTEGER NOT NULL,
    `image` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_produit`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produit_Commande` (
    `id_produit_commande` INTEGER NOT NULL AUTO_INCREMENT,
    `id_produit` INTEGER NOT NULL,
    `id_commande` INTEGER NOT NULL,

    PRIMARY KEY (`id_produit_commande`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commande` (
    `id_commande` INTEGER NOT NULL AUTO_INCREMENT,
    `date_commande` DATETIME(3) NOT NULL,
    `type_abonnement` VARCHAR(191) NOT NULL,
    `duree_abonnement` INTEGER NOT NULL,
    `montant_total` DOUBLE NOT NULL,
    `statut_commande` VARCHAR(191) NOT NULL,
    `mode_paiement` VARCHAR(191) NOT NULL,
    `dernier_chiffre_cb` VARCHAR(191) NOT NULL,
    `facture_pdf_url` VARCHAR(191) NOT NULL,
    `date_renouvellement` DATETIME(3) NOT NULL,
    `id_client` INTEGER NOT NULL,

    PRIMARY KEY (`id_commande`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id_client` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mot_de_passe` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Client_email_key`(`email`),
    PRIMARY KEY (`id_client`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Info_Paiement` (
    `id_info_paiement` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_carte` VARCHAR(191) NOT NULL,
    `numero_carte` VARCHAR(191) NOT NULL,
    `date_expiration` DATETIME(3) NOT NULL,
    `CVV` VARCHAR(191) NOT NULL,
    `est_paiement_defaut` BOOLEAN NOT NULL,
    `id_client` INTEGER NOT NULL,

    PRIMARY KEY (`id_info_paiement`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Adresse_Client` (
    `id_adresse` INTEGER NOT NULL AUTO_INCREMENT,
    `prenom` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `rue` VARCHAR(191) NOT NULL,
    `complement` VARCHAR(191) NULL,
    `cp` VARCHAR(191) NOT NULL,
    `ville` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `pays` VARCHAR(191) NOT NULL,
    `telephone_mobile` VARCHAR(191) NOT NULL,
    `est_facturation_defaut` BOOLEAN NOT NULL,
    `est_livraison_defaut` BOOLEAN NOT NULL,
    `id_client` INTEGER NOT NULL,

    PRIMARY KEY (`id_adresse`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chatbot_Conversation` (
    `id_chatbot_conversation` INTEGER NOT NULL AUTO_INCREMENT,
    `statut_conversation` VARCHAR(191) NOT NULL,
    `date_demarrage` DATETIME(3) NOT NULL,
    `date_terminaison` DATETIME(3) NULL,
    `utilisateur_email` VARCHAR(191) NOT NULL,
    `id_client` INTEGER NOT NULL,

    PRIMARY KEY (`id_chatbot_conversation`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chatbot_Message` (
    `id_chatbot_message` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(191) NOT NULL,
    `type_message` VARCHAR(191) NOT NULL,
    `date_message` DATETIME(3) NOT NULL,
    `id_chatbot_conversation` INTEGER NOT NULL,

    PRIMARY KEY (`id_chatbot_message`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chatbot_Escalade` (
    `id_chatbot_escalade` INTEGER NOT NULL AUTO_INCREMENT,
    `date_escalade` DATETIME(3) NOT NULL,
    `statut_escalade` VARCHAR(191) NOT NULL,
    `id_chatbot_conversation` INTEGER NOT NULL,

    PRIMARY KEY (`id_chatbot_escalade`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Produit` ADD CONSTRAINT `Produit_id_categorie_fkey` FOREIGN KEY (`id_categorie`) REFERENCES `Categorie`(`id_categorie`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produit_Commande` ADD CONSTRAINT `Produit_Commande_id_produit_fkey` FOREIGN KEY (`id_produit`) REFERENCES `Produit`(`id_produit`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produit_Commande` ADD CONSTRAINT `Produit_Commande_id_commande_fkey` FOREIGN KEY (`id_commande`) REFERENCES `Commande`(`id_commande`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `Client`(`id_client`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Info_Paiement` ADD CONSTRAINT `Info_Paiement_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `Client`(`id_client`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Adresse_Client` ADD CONSTRAINT `Adresse_Client_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `Client`(`id_client`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chatbot_Conversation` ADD CONSTRAINT `Chatbot_Conversation_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `Client`(`id_client`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chatbot_Message` ADD CONSTRAINT `Chatbot_Message_id_chatbot_conversation_fkey` FOREIGN KEY (`id_chatbot_conversation`) REFERENCES `Chatbot_Conversation`(`id_chatbot_conversation`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chatbot_Escalade` ADD CONSTRAINT `Chatbot_Escalade_id_chatbot_conversation_fkey` FOREIGN KEY (`id_chatbot_conversation`) REFERENCES `Chatbot_Conversation`(`id_chatbot_conversation`) ON DELETE RESTRICT ON UPDATE CASCADE;
