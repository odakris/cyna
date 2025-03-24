-- CreateTable
CREATE TABLE `User` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('CLIENT', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id_client` INTEGER NOT NULL AUTO_INCREMENT,
    `last_name` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `id_user` INTEGER NULL,

    UNIQUE INDEX `Client_email_key`(`email`),
    UNIQUE INDEX `Client_id_user_key`(`id_user`),
    PRIMARY KEY (`id_client`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id_category` INTEGER NOT NULL AUTO_INCREMENT,
    `priority_order` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_category`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id_product` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `technical_specs` TEXT NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `available` BOOLEAN NOT NULL,
    `priority_order` INTEGER NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `id_category` INTEGER NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `stock` INTEGER NOT NULL,

    PRIMARY KEY (`id_product`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderedProduct` (
    `id_ordered_product` INTEGER NOT NULL AUTO_INCREMENT,
    `id_product` INTEGER NOT NULL,
    `id_order` INTEGER NOT NULL,

    PRIMARY KEY (`id_ordered_product`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id_order` INTEGER NOT NULL AUTO_INCREMENT,
    `order_date` DATETIME(3) NOT NULL,
    `subscription_type` VARCHAR(191) NOT NULL,
    `subscription_duration` INTEGER NOT NULL,
    `total_amount` DOUBLE NOT NULL,
    `order_status` VARCHAR(191) NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `last_card_digits` VARCHAR(191) NOT NULL,
    `invoice_pdf_url` VARCHAR(191) NOT NULL,
    `renewal_date` DATETIME(3) NOT NULL,
    `id_client` INTEGER NOT NULL,

    PRIMARY KEY (`id_order`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentInfo` (
    `id_payment_info` INTEGER NOT NULL AUTO_INCREMENT,
    `card_name` VARCHAR(191) NOT NULL,
    `last_card_digits` VARCHAR(191) NOT NULL,
    `expiration_month` INTEGER NOT NULL,
    `expiration_year` INTEGER NOT NULL,
    `is_default_payment` BOOLEAN NOT NULL,
    `id_client` INTEGER NOT NULL,

    PRIMARY KEY (`id_payment_info`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientAddress` (
    `id_address` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `additional_info` VARCHAR(191) NULL,
    `postal_code` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `mobile_phone` VARCHAR(191) NOT NULL,
    `is_default_billing` BOOLEAN NOT NULL,
    `is_default_shipping` BOOLEAN NOT NULL,
    `id_client` INTEGER NOT NULL,

    PRIMARY KEY (`id_address`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatbotConversation` (
    `id_chatbot_conversation` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_status` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `user_email` VARCHAR(191) NOT NULL,
    `id_client` INTEGER NOT NULL,

    PRIMARY KEY (`id_chatbot_conversation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatbotMessage` (
    `id_chatbot_message` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(191) NOT NULL,
    `message_type` VARCHAR(191) NOT NULL,
    `message_date` DATETIME(3) NOT NULL,
    `id_chatbot_conversation` INTEGER NOT NULL,

    PRIMARY KEY (`id_chatbot_message`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatbotEscalation` (
    `id_chatbot_escalation` INTEGER NOT NULL AUTO_INCREMENT,
    `escalation_date` DATETIME(3) NOT NULL,
    `escalation_status` VARCHAR(191) NOT NULL,
    `id_chatbot_conversation` INTEGER NOT NULL,

    PRIMARY KEY (`id_chatbot_escalation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id_message` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `sent_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_message`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_id_category_fkey` FOREIGN KEY (`id_category`) REFERENCES `Category`(`id_category`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderedProduct` ADD CONSTRAINT `OrderedProduct_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `Product`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderedProduct` ADD CONSTRAINT `OrderedProduct_id_order_fkey` FOREIGN KEY (`id_order`) REFERENCES `Order`(`id_order`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `Client`(`id_client`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentInfo` ADD CONSTRAINT `PaymentInfo_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `Client`(`id_client`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientAddress` ADD CONSTRAINT `ClientAddress_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `Client`(`id_client`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatbotConversation` ADD CONSTRAINT `ChatbotConversation_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `Client`(`id_client`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatbotMessage` ADD CONSTRAINT `ChatbotMessage_id_chatbot_conversation_fkey` FOREIGN KEY (`id_chatbot_conversation`) REFERENCES `ChatbotConversation`(`id_chatbot_conversation`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatbotEscalation` ADD CONSTRAINT `ChatbotEscalation_id_chatbot_conversation_fkey` FOREIGN KEY (`id_chatbot_conversation`) REFERENCES `ChatbotConversation`(`id_chatbot_conversation`) ON DELETE RESTRICT ON UPDATE CASCADE;
