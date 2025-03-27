-- CreateTable
CREATE TABLE `Category` (
    `id_category` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `priority_order` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    INDEX `Category_priority_order_idx`(`priority_order`),
    PRIMARY KEY (`id_category`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id_product` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `technical_specs` TEXT NOT NULL,
    `unit_price` FLOAT NOT NULL,
    `discount_price` FLOAT NULL,
    `available` BOOLEAN NOT NULL DEFAULT true,
    `priority_order` INTEGER NOT NULL DEFAULT 1,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `main_image` VARCHAR(255) NOT NULL,
    `id_category` INTEGER NOT NULL,

    UNIQUE INDEX `Product_name_key`(`name`),
    INDEX `Product_id_category_idx`(`id_category`),
    INDEX `Product_available_idx`(`available`),
    INDEX `Product_priority_order_idx`(`priority_order`),
    INDEX `Product_name_idx`(`name`),
    PRIMARY KEY (`id_product`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CarouselImage` (
    `id_carousel_image` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(255) NOT NULL,
    `alt` VARCHAR(150) NULL,
    `priority_order` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `id_product` INTEGER NOT NULL,

    INDEX `CarouselImage_id_product_priority_order_idx`(`id_product`, `priority_order`),
    PRIMARY KEY (`id_carousel_image`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCarousselImage` (
    `id_product_caroussel_image` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(255) NOT NULL,
    `alt` VARCHAR(150) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `id_product` INTEGER NOT NULL,

    INDEX `ProductCarousselImage_id_product_idx`(`id_product`),
    PRIMARY KEY (`id_product_caroussel_image`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id_order_item` INTEGER NOT NULL AUTO_INCREMENT,
    `subscription_type` ENUM('MONTHLY', 'YEARLY', 'PER_USER', 'PER_MACHINE') NOT NULL,
    `subscription_status` ENUM('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
    `subscription_duration` INTEGER NOT NULL,
    `renewal_date` DATETIME(3) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_price` FLOAT NOT NULL,
    `id_product` INTEGER NOT NULL,
    `id_order` INTEGER NOT NULL,

    INDEX `OrderItem_id_order_idx`(`id_order`),
    INDEX `OrderItem_id_product_idx`(`id_product`),
    INDEX `OrderItem_subscription_status_idx`(`subscription_status`),
    INDEX `OrderItem_renewal_date_idx`(`renewal_date`),
    PRIMARY KEY (`id_order_item`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id_order` INTEGER NOT NULL AUTO_INCREMENT,
    `order_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total_amount` FLOAT NOT NULL,
    `subtotal` FLOAT NOT NULL DEFAULT 0,
    `order_status` ENUM('PENDING', 'PAID', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `payment_method` VARCHAR(50) NOT NULL,
    `last_card_digits` VARCHAR(4) NULL,
    `invoice_number` VARCHAR(50) NOT NULL,
    `invoice_pdf_url` VARCHAR(255) NULL,
    `id_user` INTEGER NOT NULL,
    `id_address` INTEGER NOT NULL,

    UNIQUE INDEX `Order_invoice_number_key`(`invoice_number`),
    INDEX `Order_id_user_idx`(`id_user`),
    INDEX `Order_order_date_idx`(`order_date`),
    INDEX `Order_order_status_idx`(`order_status`),
    INDEX `Order_invoice_number_idx`(`invoice_number`),
    PRIMARY KEY (`id_order`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('CUSTOMER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `verify_token` VARCHAR(255) NULL,
    `two_factor_enabled` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_email_verified_idx`(`email_verified`),
    INDEX `User_created_at_idx`(`created_at`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartItem` (
    `id_cart_item` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `subscription_type` ENUM('MONTHLY', 'YEARLY', 'PER_USER', 'PER_MACHINE') NOT NULL DEFAULT 'MONTHLY',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `id_product` INTEGER NOT NULL,
    `sessionId_session` INTEGER NULL,
    `userId_user` INTEGER NULL,

    INDEX `CartItem_id_product_idx`(`id_product`),
    UNIQUE INDEX `CartItem_sessionId_session_id_product_subscription_type_key`(`sessionId_session`, `id_product`, `subscription_type`),
    PRIMARY KEY (`id_cart_item`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id_session` INTEGER NOT NULL AUTO_INCREMENT,
    `session_token` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_user` INTEGER NULL,

    UNIQUE INDEX `Session_session_token_key`(`session_token`),
    INDEX `Session_id_user_idx`(`id_user`),
    INDEX `Session_session_token_idx`(`session_token`),
    INDEX `Session_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id_session`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id_message` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `sent_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `id_user` INTEGER NULL,

    INDEX `ContactMessage_id_user_idx`(`id_user`),
    INDEX `ContactMessage_is_read_idx`(`is_read`),
    INDEX `ContactMessage_sent_date_idx`(`sent_date`),
    PRIMARY KEY (`id_message`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentInfo` (
    `id_payment_info` INTEGER NOT NULL AUTO_INCREMENT,
    `card_name` VARCHAR(100) NOT NULL,
    `last_card_digits` VARCHAR(4) NOT NULL,
    `expiration_month` TINYINT NOT NULL,
    `expiration_year` SMALLINT NOT NULL,
    `provider_token_id` VARCHAR(255) NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `id_user` INTEGER NOT NULL,

    INDEX `PaymentInfo_id_user_idx`(`id_user`),
    INDEX `PaymentInfo_is_default_idx`(`is_default`),
    PRIMARY KEY (`id_payment_info`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id_address` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `address1` VARCHAR(255) NOT NULL,
    `address2` VARCHAR(255) NULL,
    `postal_code` VARCHAR(20) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `region` VARCHAR(100) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    `mobile_phone` VARCHAR(20) NOT NULL,
    `is_default_billing` BOOLEAN NOT NULL DEFAULT false,
    `is_default_shipping` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `id_user` INTEGER NOT NULL,

    INDEX `Address_id_user_idx`(`id_user`),
    INDEX `Address_is_default_billing_idx`(`is_default_billing`),
    INDEX `Address_is_default_shipping_idx`(`is_default_shipping`),
    INDEX `Address_country_region_city_idx`(`country`, `region`, `city`),
    PRIMARY KEY (`id_address`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id_password_reset` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_user` INTEGER NOT NULL,

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    INDEX `PasswordResetToken_token_idx`(`token`),
    INDEX `PasswordResetToken_id_user_idx`(`id_user`),
    INDEX `PasswordResetToken_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id_password_reset`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_id_category_fkey` FOREIGN KEY (`id_category`) REFERENCES `Category`(`id_category`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CarouselImage` ADD CONSTRAINT `CarouselImage_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `Product`(`id_product`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCarousselImage` ADD CONSTRAINT `ProductCarousselImage_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `Product`(`id_product`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `Product`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_id_order_fkey` FOREIGN KEY (`id_order`) REFERENCES `Order`(`id_order`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_id_address_fkey` FOREIGN KEY (`id_address`) REFERENCES `Address`(`id_address`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `Product`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_sessionId_session_fkey` FOREIGN KEY (`sessionId_session`) REFERENCES `Session`(`id_session`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_userId_user_fkey` FOREIGN KEY (`userId_user`) REFERENCES `User`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactMessage` ADD CONSTRAINT `ContactMessage_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentInfo` ADD CONSTRAINT `PaymentInfo_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;
