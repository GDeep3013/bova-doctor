export function medicationPlan(patient, link) {
    return `
<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.or/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Bova</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300&display=swap" rel="stylesheet">
</head>

<body style="background:#282828; padding:0; font-family: 'Lato', sans-serif;" class="body" marginheight="0"
    topmargin="0" marginwidth="0" leftmargin="0">
    <div style="background:#282828;padding:20px 0 0 0;font-family:'Open Sans'" marginheight="0" marginwidth="0">
        <table style="background-color:#cdd3cc;padding:19px 0" width="600" border="0" align="center" cellpadding="0"
            cellspacing="0">
            <tbody>
                <tr>
                    <td valign="middle" align="left" style="padding-left:40px">
                        <a href="#m_8608657298089923778_m_7744867705541025808_">
                            <img src="https://inventory.webziainfotech.com/images/logo.png" alt="logo" style="max-width: 119px;"/>
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>
        <table style="background:#fff;padding:40px 0" width="600" border="0" align="center" cellpadding="0"
            cellspacing="0">
            <tbody>
                <tr>
                    <td style="padding-bottom:5px;padding-left:40px;padding-right:20px" align="center" valign="top">
                        <h2 style="font-family: 'Open Sans', sans-serif; color:#000;font-size:28px;font-weight:700;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:left;padding:0;margin:0">
                       Medication Plan
                        </h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding-bottom:20px;padding-left:40px" align="center" valign="top">
                        <h5 style="font-family: 'Open Sans', sans-serif; color:#000;font-size:28px;font-weight:700;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:left;padding:0;margin:0">
                          Hey ${patient?.firstName} ${patient?.lastName},  
                        </h5>
                    </td>
                </tr>
                <tr>
                    <td style="padding-bottom:20px;padding-left:40px" align="center" valign="top">
                        <p style="color:#666;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:left;padding:0;margin:7px 0 0 0;">
                            Thank you for purchasing your medication. We have created a personalized medication plan just for you. You can view your plan anytime by clicking the link below.
                        </p>
                    </td>
                </tr>
                <tr style="text-align:left">
                    <td style="padding-left:40px"> 
                        <a href="${link}"
                            style="background-color:#000;border-radius:50px;padding:12px 35px;color:#fff;font-size:13px;font-family: 'Open Sans', sans-serif;font-weight:600;font-style:normal;letter-spacing:1px;line-height:20px;text-transform:uppercase;text-decoration:none;display:inline-block; margin-top: 29px;">View Your Plan</a>
                    </td>
                </tr>
            </tbody>
        </table>
        <table style="background:#d6dee5;border-top:1px solid #d6d6d6" width="600" border="0" align="center"
            cellpadding="0" cellspacing="0">
            <tbody>
                <tr>
                </tr>
            </tbody>
        </table>
        <div class="yj6qo"></div>
        <div class="adL"></div>
    </div>
</body>

</html>
    `;
}