import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'arunpandian972000@gmail.com',
    pass: 'croxlsqtgimurnjf'
  }
});

export const mailOptions = {
  from: 'arunpandian972000@gmail.com',
  to: 'velu3prabhakaran@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

