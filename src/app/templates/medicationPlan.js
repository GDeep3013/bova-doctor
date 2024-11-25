export function medicationPlan(patient, doctor, link, items, selectedItems) {
  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

  
    const renderSelectedItems = (selectedItems) =>
        selectedItems
            .map((item ,index) => {
                const itemData = items.find((fItem) => fItem.id === item.id);
                const description = item?.product?.descriptionHtml
                    ? item.product.descriptionHtml.replace(/<[^>]*>/g, '') // Strips HTML tags
                    : '';

              return `
        
                    <tr>
                        <td style="padding: 30px 44px; background-color: ${(index +1) % 2 === 0 ? '#FFFFFF' : '#F6F6F6'};">
                            <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="max-width: 230px; padding-right: 28px;">
                                        <img style="padding: 15px 5px; width: 117px; height: 109px; border: 1px solid #E6E6E6; border-radius: 8px;"
                                            src="${
                                                item.image?.url ||
                                                item.product.images?.[0]?.url ||
                                                '/images/product-img1.png'
                                            }"
                                            alt="product-img">
                                        <h3 style="font-size: 18px; color:#000000; font-weight: bold; line-height: 21px;">${
                                            item.title !== 'Default Title'
                                                ? item.title
                                                : item.product.title
                                        }</h3>
                                        <p style="font-size: 16px;line-height: 26px;color: #898989; overflow: hidden;width: 100%;display: -webkit-box;-webkit-line-clamp: 3;-webkit-box-orient: vertical;text-overflow: ellipsis;">${truncateText(description, 100)}</p>
                                    </td>
                                    <td style="vertical-align: top;">
                                        <ul style="width: 100%;">
                                            <li style="color:#373737; display: block; padding: 16px 20px; font-size: 14px; border-radius: 5px; background-color: ${(index +1) % 2 === 0 ? '#f6f6f6' : '#ffffff'}">
                                                <span style="color: #898989;">Capsules</span> ${itemData?.properties.dosage ?? ''}
                                            </li>
                                            <li style="color:#373737; display: block; margin-top: 10px; padding: 16px 20px; font-size: 14px; border-radius: 5px; background-color: ${(index +1) % 2 === 0 ? '#f6f6f6' : '#ffffff'}">
                                                <span style="color: #898989;">Frequency</span> ${itemData?.properties.frequency ?? ''}
                                            </li>
                                            <li style="color:#373737; display: block; margin-top: 10px; padding: 16px 20px; font-size: 14px; border-radius: 5px; background-color: ${(index +1) % 2 === 0 ? '#f6f6f6' : '#ffffff'}">
                                                <span style="color: #898989;">Duration</span> ${itemData?.properties.duration ?? ''}
                                            </li>
                                            <li style="color:#373737; display: block; margin-top: 10px; padding: 16px 20px; font-size: 14px; border-radius: 5px; background-color: ${(index +1) % 2 === 0 ? '#f6f6f6' : '#ffffff'}">
                                                <span style="color: #898989;">Take with</span> ${itemData?.properties.takeWith ?? ''}
                                            </li>
                                            <li style="color:#373737; display: block; margin-top: 10px; padding: 16px 20px; font-size: 14px; border-radius: 5px; background-color: ${(index +1) % 2 === 0 ? '#f6f6f6' : '#ffffff'}">
                                                <span style="color: #898989;">Note :</span> ${itemData?.properties.notes ?? ''}
                                            </li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    `;
            })
            .join('');
    return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    rel="stylesheet">
   <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: "Roboto", sans-serif;
      box-sizing: border-box;
    }

    p,
    ul,
    li {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    a{
      text-decoration: none;
    }
    a.payment-btn {
    display: inline-block;
    padding: 12px 34px;
    text-align: center;
    background-color: #000;
    border-radius: 8px;
    font-size: 16px;
    color: #fff !important;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  a.payment-btn:hover {
    background-color: #ff0000;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }
  table.add_tr_bg tr:nth-child(odd) td.bg-add{ background-color: #F6F6F6; }
  table.add_tr_bg tr:nth-child(odd) td.bg-add li{ background-color: #ffffff; }
  table.add_tr_bg tr td.bg-add li{ background-color: #F6F6F6; }
    @media print {
      body{
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
    }
  </style>
</head>

<body>
  <table width="100%" border="0" cellpadding="0" cellspacing="0"
    style="width: 100%; margin: 0 auto; max-width: 620px;">
    <tr>
      <td style="padding:12px 20px; text-align: center; background-color: #CDD3CC;">
        <img style="max-width: 143px;"
          src="https://inventory.webziainfotech.com/images/dash-logo.png"
          alt="logo" />
      </td>
    </tr>

    <tr>
      <td style="background-color: #ffffff; padding: 24px 44px;">
        <p style="color:#454545; font-size: 14px; line-height: 22px; font-weight:bold;">Dear ${patient?.firstName} ${patient?.lastName},</p>
        <p style="color:#454545; font-size: 14px; line-height: 22px; margin-top: 30px;">I hope this message finds you
          well. As part of your ongoing care, I've put together a personalized Medication Plan to help you manage your
          health more effectively. This plan includes:</p>
      </td>
    </tr>

    <tr>
      <td>
        <ul style="padding:23px 44px; background-color: #F8F8F8;">
          <li style="list-style: disc; font-weight: 400; color: #686868; font-size: 14px; line-height: 25px;"> A list of your current medications </li>
          <li style="list-style: disc; font-weight: 400; color: #686868; font-size: 14px; line-height: 25px;"> Dosage instructions. </li>
          <li style="list-style: disc; font-weight: 400; color: #686868; font-size: 14px; line-height: 25px;"> The times you should take each medication. </li>
          <li style="list-style: disc; font-weight: 400; color: #686868; font-size: 14px; line-height: 25px;">Any special instructions (e.g., take with food, avoid alcohol, etc.)</li>
          <li style="list-style: disc; font-weight: 400; color: #686868; font-size: 14px; line-height: 25px;">Potential side effects to watch out for</li>
        </ul>
        <p style="font-weight: 400; color: #454545; font-size: 14px; line-height: 25px; padding: 23px 44px;">
          Please take a moment to review your plan. If you have any questions or concerns, feel free to reach out. It's
          important that you follow these instructions closely to get the best results from your treatment.
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <table width="100%" border="0" cellpadding="0" cellspacing="0" class="add_tr_bg">
           ${renderSelectedItems(selectedItems)}
        </table>
      </td>
    </tr>
    <tr>
      <td style="background-color: #CDD3CC; padding:24px 44px;">
        <p style="display: block; text-align: center; padding-bottom: 15px;"><a class="payment-btn"  href="${link}">
          Make Payment
        </a>
      </p>
        <p style="color:#454545; font-size: 14px; line-height: 22px;">If you experience any unusual symptoms or side effects, do not hesitate to contact me immediately.</p>
        <p style="color:#454545; font-size: 14px; line-height: 22px; margin-top: 20px;">
          Stay well,
        </p>
        <p style="color:#454545; font-size: 14px; line-height: 22px;">
          Dr. ${doctor?.name}
        </p>
        <p style="color:#454545; font-size: 14px; line-height: 22px;">
       Contact Email: ${doctor?.email}
        </p>
        <p style="color:#454545; font-size: 14px; line-height: 22px;">
       Address: ${doctor?.clinicName}
        </p>
      </td>
    </tr>

  </table>

</body>

</html>
    `;
}