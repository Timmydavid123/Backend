

// Configure nodemailer with your email service provider details
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'adeleketimileyin11@gmail.com',
      pass: 'Temiloluwa123',
    },
  });
  

app.post('/submit-property-form', async (req, res) => {
    const formData = req.body;
  
    // Save form data to MongoDB
    try {
      const savedForm = await PropertyFormModel.create(formData);
  
      // Send an email to the provided email address
      await sendConfirmationEmail(formData.emailAddress);
  
      console.log('Form submitted and saved to database:', savedForm);
      res.json({ message: 'Form submitted successfully!' });
    } catch (error) {
      console.error('Error saving form data to database:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Function to send a confirmation email
  async function sendConfirmationEmail(emailAddress) {
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: emailAddress,
      subject: 'Property Form Submission Received',
      text: 'Thank you for submitting the property form. Your submission is being processed for review. We will get back to you shortly.',
    };
  
    // Use nodemailer to send the email
    await transporter.sendMail(mailOptions);
  }
  