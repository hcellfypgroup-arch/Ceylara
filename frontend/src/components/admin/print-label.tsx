"use client";

import { useEffect } from "react";

type OrderItem = {
  title: string;
  quantity: number;
  size?: string;
  color?: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  address: {
    recipientName?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
};

type PrintLabelProps = {
  order: Order;
  onClose: () => void;
};

export const PrintLabel = ({ order, onClose }: PrintLabelProps) => {
  useEffect(() => {
    // Helper function to escape HTML
    const escapeHtml = (text: string) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    // Format items list
    const itemsText = order.items
      .map(
        (item) =>
          `${item.quantity} × ${item.title || "Item"}${item.size ? ` (${item.size})` : ""}`
      )
      .join(", ");

    // Format order number (matching the format used in orders page)
    const orderId = order._id || "";
    const shortId = orderId.slice(-8).toUpperCase();
    const orderNumber = order.orderNumber || `SLR${shortId}`;

    // Format customer address
    const customerName = order.address?.recipientName || "Customer";
    const addressLines = [
      order.address?.line1,
      order.address?.line2,
      order.address?.city,
      order.address?.state,
      order.address?.postalCode,
      order.address?.country,
    ].filter(Boolean);

    // Store company address (from the template)
    const companyName = "CEYLARA CREATIONS";
    const companyAddress = ["No 435,", "Kirindivita Road", "Ganemulla"];

    // Get base URL for images
    const baseUrl = window.location.origin;
    const handWashImg = `${baseUrl}/hand-wash.png`;
    const ironImg = `${baseUrl}/iron.png`;
    const recycleImg = `${baseUrl}/recycle.png`;
    const qrcodeImg = `${baseUrl}/qrcode.png`;

    // Create print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the label");
      onClose();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shipping Label - ${orderNumber}</title>
        <style>
          @page {
            size: 4in 3in;
            margin: 0;
          }

          @media print {
            @page {
              size: 4in 3in;
              margin: 0;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            .label-container {
              margin: 0;
              page-break-inside: avoid;
            }
          }

          @font-face {
            font-family: 'Gravesend';
            src: local('Georgia'), local('serif');
            font-weight: normal;
            font-style: normal;
          }

          body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
            font-family: Arial, sans-serif;
          }

          .label-container {
            width: 4in;
            height: 3in;
            max-width: 4in;
            max-height: 3in;
            border: 0.03in solid black;
            border-radius: 0.1in;
            padding: 0.15in;
            box-sizing: border-box;
            background-color: white;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .logo {
            text-align: center;
            font-size: 0.3in;
            font-weight: bold;
            margin-bottom: 0.1in;
            padding-bottom: 0.05in;
            border-bottom: 0.03in solid black;
            font-family: 'Gravesend', Georgia, serif;
          }

          .address-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.1in;
            padding-bottom: 0.05in;
            border-bottom: 0.03in solid black;
            font-size: 0.1in;
            line-height: 1.2;
          }

          .address-box {
            width: calc(50% - 0.05in);
            position: relative;
          }

          .sub-head {
            font-size: 0.13in;
          }

          .address-box:first-child {
            border-right: 0.03in solid black; 
            padding-right: 0.1in;
          }

          .address-box:last-child {
            padding-left: 0.1in;
          }

          .address-content-grid {
            display: grid;
            grid-template-columns: min-content 1fr;
            gap: 0.05in;
          }

          .address-content-grid p {
            margin: 0;
            line-height: inherit;
          }

          .address-content-grid .address-text .name {
            font-weight: bold;
          }

          .address-content-grid strong {
            grid-column: 1;
            font-weight: bold;
            white-space: nowrap;
          }

          .address-text {
            grid-column: 2;
          }

          .address-info {
            padding-top: 0.03in;
          }

          .priority-mail {
            text-align: center;
            font-weight: bold;
            margin-bottom: 0.05in;
            padding-bottom: 0.05in;
            border-bottom: 0.03in solid black;
            flex-grow: 0;
          }

          .priority-mail .item-list {
            margin: 0;
            font-size: 0.15in;
            line-height: 1.2;
          }

          .tracking-section {
            display: flex;
            align-items: flex-end;
            margin-bottom: 0.1in;
            flex-grow: 1;
            min-height: 0.5in; 
            justify-content: space-between;
          }

          .icons-section {
            display: flex;
            align-items: flex-end;
            justify-content: flex-start;
            margin-right: 0.2in;
            flex-shrink: 0;
          }

          .shipping-icon {
            width: 0.5in;
            height: 0.5in;
            margin-right: 0.05in;
            border: 0.02in solid black;
            border-radius: 0.1in;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .qr-icon {
            width: 0.9in;
            height: 0.5in;
            margin-right: 0.05in;
            border: 0.02in solid black;
            border-radius: 0.1in;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .qr-icon img {
            width: 100%;
            height: 95%;
            object-fit: contain;
            padding: 0.02in;
            box-sizing: border-box;
          }

          .shipping-icon img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 0.02in;
            box-sizing: border-box;
          }
            
          .qrcode-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            flex-shrink: 0;
          }

          .qrcode-section p {
            margin: 0.05in 0 0 0;
            font-size: 0.08in;
            text-align: center;
          }

          .footer-section {
            display: flex;
            justify-content: space-between;
            padding-top: 0.07in;
            border-top: 0.03in solid black;
            font-size: 0.1in;
          }

          .item-no p, .delivery-instruction p {
            margin: 0;
          }

          .item-no p:last-child {
            font-weight: bold;
          }

          .delivery-instruction {
            text-align: right;
          }

          .delivery-instruction span {
            display: block;
            font-size: 0.08in;
            color: #555;
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="logo">CEYLARA</div>

          <div class="address-section">
            <div class="address-box">
              <div class="address-content-grid">
                <strong class="sub-head">From:</strong>
                <div class="address-text">
                  <p class="name">${escapeHtml(companyName)}</p>
                  <div class="address-info">
                    ${companyAddress.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
                  </div>
                </div>
              </div>
            </div>

            <div class="address-box">
              <div class="address-content-grid">
                <strong class="sub-head">To:</strong>
                <div class="address-text">
                  <p class="name">${escapeHtml(customerName)}</p>
                  <div class="address-info">
                    ${addressLines.length > 0 
                      ? addressLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")
                      : "<p>Address not available</p>"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="priority-mail">
            <p class="item-list">${escapeHtml(itemsText || "No items")}</p>
          </div>

          <div class="tracking-section">
            <div class="icons-section">
              <div class="shipping-icon">
                <img src="${handWashImg}" alt="Hand Wash" onerror="this.style.display='none'">
              </div>
              <div class="shipping-icon">
                <img src="${ironImg}" alt="Iron" onerror="this.style.display='none'">
              </div>
              <div class="shipping-icon">
                <img src="${recycleImg}" alt="Recycle" onerror="this.style.display='none'">
              </div>
            </div>
            
            <div class="qrcode-section"> 
              <div class="qr-icon"> 
                <img src="${qrcodeImg}" alt="QR Code" onerror="this.style.display='none'">
              </div>
              <p>Visit Our Official Web Store</p>
            </div>
          </div>

          <div class="footer-section">
            <div class="item-no">
              <p>OrderId:</p>
              <p>${escapeHtml(orderNumber)}</p>
            </div>
            <div class="delivery-instruction">
              <p>Delivery instruction</p>
              <span>May be opened officially</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      onClose();
    }, 250);
  }, [order, onClose]);

  return null;
};

