const { formatDate } = require('./datetimeHelpers');

function getEmailBody(templateName, apiBaseUrl, clientBaseUrl, variables) {
  const {
    notificationMessage,
    invoiceUrl,
    currentDate,
    planTitle,
    meetingTitle,
    meetingDescription,
    meetingDateTime,
    timeZone,
    meetingLink,
    inviteUserUrl,
    hash,
    verificationCode,
    userName,
    offerUrl,
    resetUrl,
    offerDescription,
    teamName,
    taskName,
    positionName,
    applicantName,
    taskLink,
    candidateName,
    offerExpiryDate,
    offerLink,
    teamsList,
  } = variables;
  // apiBaseUrl.includes('localhost')
  //   ? (apiBaseUrl = 'http://115.186.167.218:3000')
  //   : (apiBaseUrl = apiBaseUrl);
  // clientBaseUrl.includes('localhost')
  //   ? (clientBaseUrl = 'http://115.186.167.218:3001')
  //   : (clientBaseUrl = clientBaseUrl);
  const applicationBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Position Applied</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <p
            style="
              padding-top: 16px;
              color: #616161;

              font-size: 14px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
          Hi <b>${applicantName}</b>,<br><br>

We have received your Application for the <b>${positionName}</b>. We are currently reviewing it and will reach out again as soon as there is an update.<br><br>

Best Regards,<br>
Exact Careers Talent Team
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const teamInviteBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Team Invitation</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            Invitation for hiring team
          </h2>
          <p
            style="
              padding-top: 16px;
              color: #616161;

              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            You have been invited to be added in Hiring Team. Please click on
            button below to accept the invitation.
          </p>
          <div style="display: flex; justify-content: center">
            <a
              href=${inviteUserUrl}/${hash}
              style="
                text-decoration: none;
                margin: auto;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #2196f3;
                background: #2196f3;
                box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
                color: #fff;
              "
            >
              Accept the Invitation
            </a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const componentsBody = ``;
  const emailVerificationBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            Verify Your Email
          </h2>
          <p
            style="
              color: #616161;
              padding-top: 16px;
              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            Hi there!
            <br />
            Please enter the verification code into your signup form to confirm
            your email address. It will provide access to your account. Code
            will be valid within 10 minutes only!
            <br />
            <br />
            <span style="font-weight: 600"
              >Code will be valid within 10 minutes only!</span
            >
          </p>

          <div style="display: flex; justify-content: center">
            <div
              style="
                margin: auto;
                padding: 8px 16px;
                border: 1px solid #2196f3;
              "
            >
              <b>${verificationCode}</b>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const forgotPasswordBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Forgot Password</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            Forgot Password
          </h2>
          <p
            style="
              padding-top: 16px;
              color: #616161;

              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            You are receiving this email because you have requested a password
            reset. Use the following link to reset your password. This link will
            only be applicable within 10 minutes.
          </p>
          <div style="display: flex; justify-content: center">
            <a
              href=${resetUrl}/${hash}
              style="
                margin: auto;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #2196f3;
                background: #2196f3;
                box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
                color: #fff;
                text-decoration: none;
                font-size: 14px;
              "
              >Reset Password</a
            >
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const newTaskBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Task</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            New Task
          </h2>
          <p
            style="
              text-align: center;
              padding-top: 16px;
              color: #616161;

              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            A new task <b>${taskName}</b> has been assigned to you!
          </p>
          <div style="display: flex; justify-content: center">
            <a
              href="${clientBaseUrl}/tasks"
              style="
                margin: auto;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #2196f3;
                background: #2196f3;
                box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
                color: #fff;
                text-decoration: none;
                font-size: 14px;
              "
              >Review Task</a
            >
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const offerBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Job Offer</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="images/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <p
            style="
              padding-top: 16px;
              color: #616161;

              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            ${offerDescription}
          </p>
          <div style="display: flex; justify-content: center">
            <a
              href=${offerUrl}/${hash}
              style="
                margin: auto;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #2196f3;
                background: #2196f3;
                box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
                color: #fff;
                text-decoration: none;
                font-size: 14px;
              "
              >View Offer</a
            >
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="images/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="images/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="images/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const notificationBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Team Assigned</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
         <h1
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            Notification Alert
          </h1>
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            ${notificationMessage}
          </h2>
          <div style="display: flex; justify-content: center">
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  const acceptInvitationTeamBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Team Assigned</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            <b>${userName}</b> accepted invitation
          </h2>
          <p
            style="
              text-align: center;
              padding-top: 16px;
              color: #616161;
              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            <b>${userName}</b> has accepted invitation and has been added in team <b>${teamName}</b>. Click on the link below to see the
            details
          </p>
          <div style="display: flex; justify-content: center">
            <a
              href="${clientBaseUrl}/settings/company-settings/team-management"
              style="
                margin: auto;
                font-size: 14px;
                font-style: normal;
                font-weight: 500;
                color: #2196f3;
                padding: 8px;
                text-decoration: none;
              "
              >Click Here</a
            >
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  const acceptInvitationBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Team Assigned</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            <b>${userName}</b> accepted invitation
          </h2>
          <p
            style="
              text-align: center;
              padding-top: 16px;
              color: #616161;
              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            <b>${userName}</b> has accepted invitation request. Click on the link below to go to company dashboard
          </p>
          <div style="display: flex; justify-content: center">
            <a
              href="${clientBaseUrl}"
              style="
                margin: auto;
                font-size: 14px;
                font-style: normal;
                font-weight: 500;
                color: #2196f3;
                padding: 8px;
                text-decoration: none;
              "
              >Click Here</a
            >
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  const userTeamAssignedBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Team Assigned</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            Teams Assigned
          </h2>
          <p
            style="
              color: #616161;
              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            You have been added in a team. Click on the link below to see the
            details
          </p>

        <div>
        <ul style="
          color: #616161;
          font-size: 12px;
          font-style: normal;
          display: inline-block;
          text-align: left;">
          ${teamsList?.map((name) => `<li><b>${name}</b></li>`).join('')}
        </ul>
    </div>
          <div style="display: flex; justify-content: center">
            <a
              href="${clientBaseUrl}/settings/company-settings/team-management"
              style="
                margin: auto;
                font-size: 14px;
                font-style: normal;
                font-weight: 500;
                color: #2196f3;
                padding: 8px;
                text-decoration: none;
              "
              >View Teams</a
            >
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  const teamAssignedBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Team Assigned</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            New User in Team
          </h2>
          <p
            style="
              text-align: center;
              padding-top: 16px;
              color: #616161;
              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            <b>${userName}</b> has been added in team <b>${teamName}</b>. Click on the link below to see the
            details
          </p>
          <div style="display: flex; justify-content: center">
            <a
              href="${clientBaseUrl}/settings/company-settings/team-management"
              style="
                margin: auto;
                font-size: 14px;
                font-style: normal;
                font-weight: 500;
                color: #2196f3;
                padding: 8px;
                text-decoration: none;
              "
              >Click Here</a
            >
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  const taskCompletedBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Task</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            Task Updated
          </h2>
          <p
            style="
              text-align: center;
              padding-top: 16px;
              color: #616161;

              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            Task <b>${taskName}</b> has been completed!
          </p>
          <div style="display: flex; justify-content: center">
            <a
              href="${clientBaseUrl}/tasks"
              style="
                margin: auto;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #2196f3;
                background: #2196f3;
                box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
                color: #fff;
                text-decoration: none;
                font-size: 14px;
              "
              >Review Task</a
            >
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const taskOverdueBody = ``;
  const trialBody = ``;
  const welcomeBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            Welcome to Exact Careers <b>${userName}</b>
          </h2>
          <p
            style="
              padding-top: 16px;
              color: #616161;

              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            Thanks for signing up! Let’s get started with automating your hiring
            process. You can enjoy the following features that can help you hire
            the best candidate for your company!
          </p>
          <div style="padding: 8px 24px">
            <div
              style="
                display: flex;
                padding: 8px 24px;
                align-items: center;
                background: #fafafa;
                margin-bottom: 8px;
                gap: 20px;
              "
            >
              <div>
                <img src="${apiBaseUrl}/api/common/wc-1.png" />
              </div>
              <div>
                <div
                  style="
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    background: #2196f3;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  "
                >
                  <p
                    style="
                      color: #fff;
                      font-size: 12px;
                      font-style: normal;
                      font-weight: 500;
                    "
                  >
                    1
                  </p>
                </div>
              </div>
              <div>
                <p
                  style="
                    color: #212121;
                    font-size: 12px;
                    font-style: normal;
                    font-weight: 500;
                  "
                >
                  Automate your hiring process
                </p>
              </div>
            </div>
            <div
              style="
                display: flex;
                padding: 8px 24px;
                align-items: center;
                background: #fafafa;
                margin-bottom: 8px;
                gap: 20px;
              "
            >
              <div>
                <img src="${apiBaseUrl}/api/common/wc-2.png" />
              </div>
              <div>
                <div
                  style="
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    background: #2196f3;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  "
                >
                  <p
                    style="
                      color: #fff;
                      font-size: 12px;
                      font-style: normal;
                      font-weight: 500;
                    "
                  >
                    2
                  </p>
                </div>
              </div>
              <div>
                <p
                  style="
                    color: #212121;
                    font-size: 12px;
                    font-style: normal;
                    font-weight: 500;
                  "
                >
                  Schedule interviews with candidates
                </p>
              </div>
            </div>
            <div
              style="
                display: flex;
                padding: 8px 24px;
                align-items: center;
                background: #fafafa;
                margin-bottom: 8px;
                gap: 20px;
              "
            >
              <div>
                <img src="${apiBaseUrl}/api/common/wc-3.png" />
              </div>
              <div>
                <div
                  style="
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    background: #2196f3;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  "
                >
                  <p
                    style="
                      color: #fff;
                      font-size: 12px;
                      font-style: normal;
                      font-weight: 500;
                    "
                  >
                    3
                  </p>
                </div>
              </div>
              <div>
                <p
                  style="
                    color: #212121;
                    font-size: 12px;
                    font-style: normal;
                    font-weight: 500;
                  "
                >
                  Assign and keep track of the tasks within your team
                </p>
              </div>
            </div>
            <div
              style="
                display: flex;
                padding: 8px 24px;
                align-items: center;
                background: #fafafa;
                margin-bottom: 8px;
                gap: 20px;
              "
            >
              <div>
                <img src="${apiBaseUrl}/api/common/wc-4.png" />
              </div>
              <div>
                <div
                  style="
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    background: #2196f3;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  "
                >
                  <p
                    style="
                      color: #fff;
                      font-size: 12px;
                      font-style: normal;
                      font-weight: 500;
                    "
                  >
                    4
                  </p>
                </div>
              </div>
              <div>
                <p
                  style="
                    color: #212121;
                    font-size: 12px;
                    font-style: normal;
                    font-weight: 500;
                  "
                >
                  Connect and recruit best candidates for your company
                </p>
              </div>
            </div>
            <div
              style="
                display: flex;
                padding: 8px 24px;
                align-items: center;
                background: #fafafa;
                margin-bottom: 8px;
                gap: 20px;
              "
            >
              <div>
                <img src="${apiBaseUrl}/api/common/wc-5.png" />
              </div>
              <div>
                <div
                  style="
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    background: #2196f3;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  "
                >
                  <p
                    style="
                      color: #fff;
                      font-size: 12px;
                      font-style: normal;
                      font-weight: 500;
                    "
                  >
                    5
                  </p>
                </div>
              </div>
              <div>
                <p
                  style="
                    color: #212121;
                    font-size: 12px;
                    font-style: normal;
                    font-weight: 500;
                  "
                >
                  Enjoy pool of candidates and chose the best amongst them
                </p>
              </div>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const createZoomMeetingBody = `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>zoom meeting</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            ${meetingTitle}
          </h2>
          <p
            style="
              text-align: center;
              padding-top: 16px;
              color: #616161;

              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            ${meetingDescription}
            <br>
            <br>
            <b>${meetingLink}</b> <br>
            <b>${meetingDateTime}</b> <br>
            <b>${timeZone}</b>
          </p>
          <div style="display: flex; justify-content: center">
            <a
              href="${meetingLink}"
              style="
                margin: auto;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #2196f3;
                background: #2196f3;
                box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
                color: #fff;
                text-decoration: none;
                font-size: 14px;
              "
              >Open Meeting</a
            >
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
  const deleteZoomMeetingBody = `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Interview Update</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            Interview Cancelation Update
          </h2>
          <p
            style="
              text-align: center;
              padding-top: 16px;
              color: #616161;

              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            Interview <b>${meetingTitle}</b> was canceled
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
  const updateZoomMeetingBody = `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Interview Update</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            Interview Reschedule Update
          </h2>
          <p
            style="
              text-align: center;
              padding-top: 16px;
              color: #616161;

              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            Interview <b>${meetingTitle}</b> was rescheduled to <b>${meetingDateTime}</b>
            <br>
            <br>
            ${meetingDescription}
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src=${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
  const subscriptionCreatedBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ExactCareer Subscription</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            Thanks for Subscribing
          </h2>
          <p
            style="
              padding-top: 16px;
              color: #616161;

              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
            Hi <b>${userName}</b>,<br/><br/>

Congratulations! You have successfully subscribed Exact Careers <b>${planTitle}</b> Plan. ExactCareers transforms your recruitment process, maximize efficiency and connect with the top talent worldwide.<br/><br/>

You can manage your subscription plan, view past invoices and more. Of course, you can cancel your subscription at any time as well.<br/><br/>

We hope you enjoy using Exact Careers.<br/><br/>

Cheers,<br/>
Exact Careers Team<br/>

Current Invoice: ${invoiceUrl} <br/>
          </p>

          <div style="display: flex; justify-content: center">
            <a
              href=${clientBaseUrl}/settings/company-settings/billing
              style="
                text-decoration: none;
                margin: auto;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #2196f3;
                background: #2196f3;
                box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
                color: #fff;
              "
            >
              View Plan
            </a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const subscriptionCanceledBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ExactCareer Subscription</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
    />
  </head>

  <body style="background: #f5f5f5; font-family: Arial, Helvetica, sans-serif">
    <table style="width: 700px; margin: 0 auto; border: 0">
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <img src="${apiBaseUrl}/api/common/ExactCareers-Logo-Vertical.png" />
        </td>
      </tr>
      <tr style="background: #fff">
        <td
          style="
            padding: 16px 30px;
            border-radius: 4px;
            border-bottom: 5px solid #fece32;
          "
        >
          <h2
            style="
              color: #212121;
              text-align: center;

              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.024px;
            "
          >
            Your Subscription is Cancelled
          </h2>
          <p
            style="
              padding-top: 16px;
              color: #616161;

              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 181%;
            "
          >
           Hi <b>${userName}</b>, <br/><br/>

We are sorry to see you go. As you requested, we have cancelled your subscribed plan effective from ${formatDate(
    currentDate
  )}.<br/><br/>

Obviously, we’d love to have you back. If you change your mind, you can reactivate your subscription at any time just by clicking Reactivate Plan button below. There’s is still so much and we are always adding more. <br/><br/>

Hope to see you back soon.<br/><br/>

Regards,<br/>
Exact Careers Team<br/>
          </p>
          <div style="display: flex; justify-content: center">
            <a
              href=${clientBaseUrl}/settings/company-settings/plans-pricing
              style="
                text-decoration: none;
                margin: auto;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #2196f3;
                background: #2196f3;
                box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
                color: #fff;
              "
            >
              Reactivate Plan
            </a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 24px 10px">
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Sent from ExactCareers
          </p>
          <p
            style="
              color: #9e9e9e;
              text-align: center;

              font-size: 10px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              letter-spacing: 0.04px;
            "
          >
            Terms & Conditions
          </p>
          <ul
            style="
              display: table;
              align-items: center;
              padding: 0;
              margin: auto;
            "
          >
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/facebook.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/twitter-circled.png" alt="" />
            </li>
            <li style="display: table-cell">
              <img src="${apiBaseUrl}/api/common/linkedin-circled.png" alt="" />
            </li>
          </ul>
          <ul style="display: table; margin: auto; padding: 0">
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 12px;
                  font-style: normal;
                  font-weight: 500;
                  line-height: normal;
                  letter-spacing: 0.048px;
                "
              >
                ExactCareers
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                  padding: 0 4px;
                "
              >
                |
              </p>
            </li>
            <li style="display: table-cell">
              <p
                style="
                  color: #9e9e9e;
                  text-align: center;

                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  letter-spacing: 0.04px;
                "
              >
                © 2022-2023, All Rights Reserved
              </p>
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const templateMap = {
    subscriptionCreated: subscriptionCreatedBody,
    subscriptionCanceled: subscriptionCanceledBody,
    application: applicationBody,
    components: componentsBody,
    emailVerification: emailVerificationBody,
    forgotPassword: forgotPasswordBody,
    newTask: newTaskBody,
    offer: offerBody,
    taskCompleted: taskCompletedBody,
    taskOverdue: taskOverdueBody,
    teamAssigned: teamAssignedBody,
    userTeamAssigned: userTeamAssignedBody,
    acceptInvitation: acceptInvitationBody,
    acceptInvitationTeam: acceptInvitationTeamBody,
    teamInvite: teamInviteBody,
    trial: trialBody,
    welcome: welcomeBody,
    createZoomMeeting: createZoomMeetingBody,
    deleteZoomMeeting: deleteZoomMeetingBody,
    updateZoomMeeting: updateZoomMeetingBody,
    Notification: notificationBody,
  };
  return templateMap[templateName];
}
module.exports = { getEmailBody };
