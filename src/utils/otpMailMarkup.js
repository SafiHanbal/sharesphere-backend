const markup = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Static Template</title>

      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
    </head>
    <body
      style="
        margin: 0;
        font-family: 'Poppins', sans-serif;
        background-color: #ffffff;
        font-size: 14px;
        max-width: 400px;
        margin: 0 auto;
        color: #434343;
      "
    >
      <div
        style="
          max-width: 400px;
          margin: 0 auto;
          padding: 40px 15px;
          background-color: #eae3e1;
          background-image: linear-gradient(
            to bottom right,
            #ff4919 0%,
            #ff4919 40%,
            #ff0064 60%,
            #ff0064 100%
          );
          background-repeat: no-repeat;
          background-size: 400px 300px;
          background-position: top center;
          font-size: 13px;
          color: #434343;
        "
      >
        <header style="text-align: center">
          <img alt="" src="cid:logo" style="height: 40px; text-align: center" />
        </header>

        <main>
          <div
            style="
              margin: 0;
              margin-top: 20px;
              padding: 30px 20px;
              background-color: #ffffff;
              border-radius: 20px;
              text-align: center;
              box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
            "
          >
            <div style="width: 100%; max-width: 360px; margin: 0 auto">
              <h1
                style="
                  margin: 0;
                  font-size: 20px;
                  font-weight: 500;
                  color: #1f1f1f;
                "
              >
                Password Reset OTP
              </h1>
              <p
                style="
                  margin: 0;
                  margin-top: 17px;
                  font-size: 16px;
                  font-weight: 500;
                "
              >
                Hello there!,
              </p>
              <p
                style="
                  margin: 0;
                  margin-top: 17px;
                  font-weight: 500;
                  letter-spacing: 0.56px;
                "
              >
                Use the following OTP to complete the procedure to change your
                password. OTP is valid for
                <span style="font-weight: 600; color: #1f1f1f">10 minutes</span>.
                Do not share this code with others, including ShareSphere
                employees.
              </p>
              <p
                style="
                  margin: 0;
                  margin-top: 60px;
                  font-size: 28px;
                  font-weight: 600;
                  letter-spacing: 10px;
                  color: #ff4919;
                  width: max-content;
                  margin: 30px auto 0;
                "
              >
                {%OTP%}
              </p>
            </div>
          </div>

          <p
            style="
              max-width: 400px;
              margin: 0 auto;
              margin-top: 30px;
              text-align: center;
              font-weight: 500;
              color: #8c8c8c;
            "
          >
            Need help? Ask at
            <a
              href="mailto:team.shareshpere@gmail.com"
              style="color: #499fb6; text-decoration: none"
              >team.shareshpere@gmail.com</a
            >
            or visit our
            <a
              href=""
              target="_blank"
              style="color: #499fb6; text-decoration: none"
              >Help Center</a
            >
          </p>
        </main>

        <div
          style="
            width: 100%;
            max-width: 490px;
            margin: 40px auto 0;
            text-align: center;
            border-top: 1px solid #e6ebf1;
          "
        >
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #434343">
            Team ShareSphere
          </p>

          <p style="margin: 0; margin-top: 16px; color: #434343">
            Copyright © 2024 Company. All rights reserved.
          </p>
        </div>
      </div>
    </body>
  </html>
`;

export const getMailMarkup = (otp) => {
  return markup.replace('{%OTP%}', otp);
};
