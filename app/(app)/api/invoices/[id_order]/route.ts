import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import orderService from "@/lib/services/order-service";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id_order: string }> }
) {
    try {
        // Récupérer la session de l'utilisateur
        const session = await getServerSession(authOptions);
        if (!session?.user?.id_user) {
            return NextResponse.json(
                { error: "Utilisateur non authentifié" },
                { status: 401 }
            );
        }

        const userId = session.user.id_user.toString();

        // Récupérer et valider l'id_order
        const { id_order } = await params;
        const orderId = parseInt(id_order);
        if (isNaN(orderId) || orderId <= 0) {
            return NextResponse.json(
                { error: "Invalid order ID" },
                { status: 400 }
            );
        }

        // Récupérer les détails de la commande
        const order = await orderService.getOrderByIdForInvoice(orderId);

        // Vérifier que la commande appartient à l'utilisateur
        if (order.id_user !== parseInt(userId)) {
            return NextResponse.json(
                { error: "Accès non autorisé à cette commande" },
                { status: 403 }
            );
        }

        // Créer le PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        const { height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;
        let yPosition = height - 50;

        // En-tête
        page.drawText("Facture", {
            x: 50,
            y: yPosition,
            size: 20,
            font,
            color: rgb(0, 0, 0),
        });
        yPosition -= 40;

        // Informations de la facture
        page.drawText(`Numéro de facture : ${order.invoice_number}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(
            `Date de la commande : ${format(
                new Date(order.order_date),
                "dd MMMM yyyy",
                { locale: fr }
            )}`,
            {
                x: 50,
                y: yPosition,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            }
        );
        yPosition -= 20;

        page.drawText(`Montant total : ${order.total_amount} €`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(`Statut : ${order.order_status}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(
            `Méthode de paiement : ${order.payment_method} ${order.last_card_digits ? `(**** ${order.last_card_digits})` : ""
            }`,
            {
                x: 50,
                y: yPosition,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            }
        );
        yPosition -= 40;

        // Adresse de facturation
        if (order.billing_address) {
            page.drawText("Adresse de facturation :", {
                x: 50,
                y: yPosition,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            });
            yPosition -= 20;
            page.drawText(
                `${order.billing_address.address1}${order.billing_address.address2
                    ? ", " + order.billing_address.address2
                    : ""
                }, ${order.billing_address.city}, ${order.billing_address.postal_code}, ${order.billing_address.country
                }`,
                {
                    x: 50,
                    y: yPosition,
                    size: fontSize,
                    font,
                    color: rgb(0, 0, 0),
                }
            );
            yPosition -= 40;
        }

        // Services associés
        page.drawText("Services associés :", {
            x: 50,
            y: yPosition,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        for (const item of order.subscriptions) {
            page.drawText(
                `${item.service_name} (${item.subscription_type}) - ${item.unit_price} € x ${item.quantity}`,
                {
                    x: 50,
                    y: yPosition,
                    size: fontSize,
                    font,
                    color: rgb(0, 0, 0),
                }
            );
            yPosition -= 20;
        }

        const pdfBytes = await pdfDoc.save();

        return new NextResponse(pdfBytes, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=facture_${order.invoice_number}.pdf`,
            },
        });
    } catch (error) {
        console.error("Error generating invoice:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to generate invoice",
            },
            { status: 500 }
        );
    }
}