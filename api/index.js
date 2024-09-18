const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const tesseract = require("tesseract.js");
const fs = require("fs");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const app = express();
const port = 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure multer for file uploads

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.listen(port, () => {
  console.log("Server is running on port 8000");
});

mongoose.connect("mongodb+srv://sa:1234567abcxyz@cluster0.48ebnyh.mongodb.net/WebOcr")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDb", err);
  });

const Document = require("./models/document");
const User = require("./models/user");
const Result = require("./models/result");
const Payment = require("./models/payment");
const Feedback = require("./models/feedback")

// Register new user
app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const newUser = new User({ email, password });
        newUser.verificationToken = crypto.randomBytes(20).toString("hex");
        await newUser.save();
        res.status(201).json({ message: "Registration successful. Please check your email for verification." });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error });
    }
});

const generateSecretKey = () => crypto.randomBytes(32).toString("hex");
const secretKey = generateSecretKey();

// Login user
app.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;
      console.log('Login attempt:', email); // Log email để kiểm tra
      const user = await User.findOne({ email });

      // Kiểm tra email hoặc mật khẩu không đúng
      if (!user || user.password !== password) {
          console.log('Invalid email or password'); // Log lỗi để kiểm tra
          return res.status(401).json({ message: "Invalid email or password" });
      }

      // Tạo token
      const token = jwt.sign({ userId: user._id ,userRole: user.userRole }, secretKey,{ expiresIn: '1h' });

      // Trả về token, userId và email trong response
      res.status(200).json({
          token,
          userId: user._id,
          email: user.email,
          userRole: user.userRole // Trả về userRole trong phản hồi

      });
  } catch (error) {
      console.error('Login error:', error); // Log lỗi để kiểm tra
      res.status(500).json({ message: "Login Failed", error });
  }
});



app.get('/user', authenticateToken, async (req, res) => {
  try {
      const userId = req.user.userId;
      console.log('Fetching user:', userId); // Log userId để kiểm tra
      const user = await User.findById(userId);
      if (!user) {
          console.log('User not found'); // Log lỗi để kiểm tra
          return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
  } catch (error) {
      console.error('Error retrieving user data:', error); // Log lỗi để kiểm tra
      res.status(500).json({ message: "Error retrieving user data", error });
  }
});
// Route để lấy tất cả người dùng
app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Lấy tất cả người dùng từ cơ sở dữ liệu

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: "Error retrieving users", error });
  }
});
app.get('/userscount', async (req, res) => {
  try {
    const users = await User.find(); // Lấy tất cả người dùng từ cơ sở dữ liệu

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ count: users.length });

  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: "Error retrieving users", error });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});

// In your Express server file
app.post('/users/change-password', async (req, res) => {
  try {
      const { userId, newPassword } = req.body;

      // Tìm người dùng theo ID
      const user = await User.findById(userId);

      if (!user) return res.status(404).json({ error: 'User not found' });

      // Cập nhật mật khẩu
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});
app.get('/users/search', async (req, res) => {
  const { email } = req.query;
  try {
    const users = await User.find({
      email: { $regex: email, $options: 'i' } // Tìm kiếm không phân biệt chữ hoa chữ thường
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: 'Error retrieving users', error });
  }
});


// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
  });
}


app.post('/uploadDocument', upload.single('file'), async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    console.log('Received userId:', userId);
    console.log('Received file:', file);

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!userId) {
      return res.status(400).json({ message: 'userId is missing.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Invalid file type. Only images are allowed." });
    }

    const imageBuffer = fs.readFileSync(file.path);
    const base64Image = imageBuffer.toString('base64');

    const document = new Document({
      userId: userId,
      fileName: file.originalname,
      filePath: file.path,
      base64Image: base64Image // Lưu base64 vào cơ sở dữ liệu
    });

    await document.save();

    console.log("Document uploaded successfully:", document);

    // Return the document ID directly
    res.status(201).json({ 
      message: "Document uploaded successfully", 
      documentId: document._id 
    });
  } catch (error) {
    console.log("Error uploading document:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Error uploading document" });
  }
});



// app.post("/processDocument/:documentId", async (req, res) => {
//   try {
//     const { documentId } = req.params;
//     const document = await Document.findById(documentId);

//     if (!document) {
//       return res.status(404).json({ message: "Document not found" });
//     }

//     const base64Image = document.base64Image || fs.readFileSync(document.filePath).toString('base64');

//     if (!base64Image) {
//       return res.status(400).json({ message: "No image data found for this document" });
//     }

//     try {
//       const ocrResponse = await axios.post('http://34.143.142.24/api/ocrbase64', {
//         crop: true,
//         printedTextDetection: true,
//         ocrPrintedText: true,
//         imageDocClassification: false,
//         align: false,
//         ocrHandwrittenText: false,
//         base64image: base64Image
//       });

//       console.log("OCR API Response:", ocrResponse.data);

//       const { statusCode, info_text, json_ocr_out } = ocrResponse.data;

//       if (statusCode === 400 || !json_ocr_out) {
//         return res.status(400).json({
//           message: "OCR processing failed",
//           infoText: info_text || "Unknown error",
//           ocrText: json_ocr_out || "No text extracted"
//         });
//       }

//       const result = new Result({
//         documentId,
//         ocrText: json_ocr_out,
//         language: 'eng'
//       });
//       await result.save();

//       res.status(200).json({
//         message: "OCR processing successful",
//         ocrText: json_ocr_out,
//         result
//       });

//     } catch (apiError) {
//       console.error("Error with OCR API request:", apiError.response ? apiError.response.data : apiError.message);
//       res.status(500).json({ message: "Error with OCR API request", error: apiError.message });
//     }
//   } catch (error) {
//     console.error("Error processing document:", error);
//     res.status(500).json({ message: "Error processing document", error: error.message });
//   }
// });

app.post("/processDocument/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Lấy userId từ tài liệu
    const userId = document.userId;

    // Lấy thông tin người dùng từ cơ sở dữ liệu
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra subscription
    const now = new Date();
    const validUntil = user.subscription.validUntil ? new Date(user.subscription.validUntil) : null;
    const remainingUses = user.subscription.remainingUses;

    if (validUntil && validUntil < now) {
      return res.status(403).json({ message: "Subscription has expired" });
    }

    if (remainingUses === 0) {
      return res.status(403).json({ message: "No remaining uses for subscription" });
    }

    // Đọc dữ liệu ảnh từ cơ sở dữ liệu hoặc tệp tin
    let base64Image;
    if (document.base64Image) {
      base64Image = document.base64Image;
    } else {
      try {
        base64Image = fs.readFileSync(document.filePath).toString('base64');
      } catch (fileError) {
        return res.status(500).json({ message: "Error reading image file", error: fileError.message });
      }
    }

    if (!base64Image) {
      return res.status(400).json({ message: "No image data found for this document" });
    }

    // Chuyển đổi base64 thành Buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Sử dụng Tesseract.js để nhận dạng văn bản từ ảnh
    const { data: { text } } = await tesseract.recognize(imageBuffer, 'eng', {
      logger: m => console.log(m) // Theo dõi tiến trình OCR
    });

    console.log("OCR Text:", text);

    // Lưu kết quả vào cơ sở dữ liệu
    const result = new Result({
      documentId,
      ocrText: text,
      language: 'eng',
      userId // Thêm userId vào kết quả
    });

    await result.save(); // Đảm bảo chờ đợi lưu trữ hoàn tất

    // Cập nhật số lần sử dụng còn lại nếu cần
    if (user.subscription.type === "per_use") {
      user.subscription.remainingUses -= 1;
      await user.save();
    }

    res.status(200).json({
      message: "OCR processing successful",
      ocrText: text,
      result
    });

  } catch (error) {
    console.error("Error processing document:", error);
    res.status(500).json({ message: "Error processing document", error: error.message });
  }
});

// Route để xử lý OCR

// Get User Documents

app.get("/getUserDocuments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching documents for userId:', userId); // Log userId để kiểm tra
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const documents = await Document.find({ userId });

    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: "No documents found for this user" });
    }

    res.status(200).json({ documents });
  } catch (error) {
    console.error('Error retrieving documents:', error); // Log lỗi chi tiết
    res.status(500).json({ message: "Error retrieving documents", error });
  }
});

// Delete Document
app.delete("/deleteDocument/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findByIdAndDelete(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    fs.unlink(document.filePath, err => {
      if (err) {
        console.error("Error deleting file from filesystem:", err);
      } else {
        console.log("File deleted successfully from filesystem:", document.filePath);
      }
    });

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting document", error });
  }
});
app.post('/results', async (req, res) => {
    try {
      const { documentId, ocrText, language } = req.body;
  
      const result = new Result({
        documentId,
        ocrText,
        language
      });
  
      await result.save();
  
      res.status(201).json({ message: "Result created successfully", result });
    } catch (error) {
      console.error("Error creating result:", error);
      res.status(500).json({ message: "Error creating result" });
    }
  });
// Đoạn mã trong file routes hoặc app.js của bạn
app.get('/resultscount', async (req, res) => {
  try {
      // Đếm số lượng kết quả trong cơ sở dữ liệu
      const count = await Result.countDocuments();
      res.status(200).json({ count });
  } catch (error) {
      console.error("Error retrieving results count:", error);
      res.status(500).json({ message: "Error retrieving results count" });
  }
});

app.get("/getUserResults/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching results for userId:', userId);

    // Kiểm tra tính hợp lệ của userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Tìm tất cả các kết quả thuộc về userId
    const results = await Result.find({ userId });

    if (!results || results.length === 0) {
      return res.status(204).json({ message: "No results found for this user" });
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error('Error retrieving results:', error);
    res.status(500).json({ message: "Error retrieving results", error });
  }
});



  // Create Payment
 
  app.use(express.json());

  app.use(express.json());

  app.use(express.json());

app.post('/payments', async (req, res) => {
    try {
        const { userId, amount, paymentMethod, subscriptionType, status } = req.body;

        // Kiểm tra dữ liệu nhận được từ request
        if (!userId) {
            console.error('userId is missing in request body:', req.body);
            return res.status(400).json({ message: 'userId is required' });
        }

        // Tìm kiếm người dùng
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Kiểm tra xem người dùng đã có gói subscription monthly chưa
        if (user.subscription.type === 'monthly' && subscriptionType === 'monthly') {
            return res.status(400).json({ message: "User already has an active monthly subscription" });
        }

        // Kiểm tra xem người dùng đã có gói subscription monthly và cố gắng mua per_use
        if (user.subscription.type === 'monthly' && subscriptionType === 'per_use') {
            return res.status(400).json({ message: "User with a monthly subscription cannot purchase a per-use subscription" });
        }

        // Tạo và lưu thanh toán
        const payment = new Payment({
            userId,
            amount,
            paymentMethod,
            subscriptionType,
            status
        });

        await payment.save();

        // Tính toán giá trị mới cho subscription
        let newSubscription = {};
        if (subscriptionType) {
            newSubscription.type = subscriptionType;
            if (subscriptionType === 'monthly') {
                newSubscription.validUntil = new Date();
                newSubscription.validUntil.setMonth(newSubscription.validUntil.getMonth() + 1);
                newSubscription.remainingUses = null; // Không cần tracking remainingUses cho monthly subscription
            } else if (subscriptionType === 'per_use') {
                newSubscription.validUntil = null;
                newSubscription.remainingUses = (user.subscription.remainingUses || 0) + 1;
            }
        }

        user.subscription = { ...user.subscription, ...newSubscription };
        await user.save();

        res.status(201).json({ message: "Payment created and subscription updated successfully", payment });
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({ message: "Error creating payment" });
    }
});


  
// Get Payment by ID
app.get('/payments/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      const payment = await Payment.findById(id).populate('userId');
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
  
      res.status(200).json({ payment });
    } catch (error) {
      console.error("Error retrieving payment:", error);
      res.status(500).json({ message: "Error retrieving payment" });
    }
  });
  app.get('/payments', async (req, res) => {
    try {
      let query = {};
  
      
  
      const payments = await Payment.find(query).populate('userId');
      res.status(200).json({ payments });
    } catch (error) {
      console.error("Error retrieving payments:", error);
      res.status(500).json({ message: "Error retrieving payments" });
    }
  });
  // API endpoint to get payments based on email and/or date range
  


//   app.get('/payments/email', async (req, res) => {
//     try {
//         const { email } = req.query;

//         // Kiểm tra nếu không có email được cung cấp
//         if (!email) {
//             return res.status(400).json({ message: "Email is required" });
//         }

//         // Tìm kiếm người dùng dựa trên email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Tìm các khoản thanh toán dựa trên ID người dùng
//         const payments = await Payment.find({ userId: user._id }).populate('userId');

//         // Trả về danh sách các khoản thanh toán
//         res.status(200).json({ payments });
//     } catch (error) {
//         console.error("Error retrieving payments by email:", error);
//         res.status(500).json({ message: "Error retrieving payments by email" });
//     }
// });

  
  

  app.get('/paymentscount', async (req, res) => {
    try {
        // Tính tổng số lượng thanh toán
        const count = await Payment.countDocuments();

        res.status(200).json({ count });
    } catch (error) {
        console.error("Error retrieving payments count:", error);
        res.status(500).json({ message: "Error retrieving payments count" });
    }
});
// Đoạn mã trong file routes hoặc app.js của bạn
app.get('/totalpayment', async (req, res) => {
  try {
      // Tính tổng số tiền thanh toán
      const result = await Payment.aggregate([
          {
              $group: {
                  _id: null,
                  totalAmount: { $sum: "$amount" }
              }
          }
      ]);

      // Nếu không có kết quả, đặt totalAmount về 0
      const totalAmount = result.length > 0 ? result[0].totalAmount : 0;

      res.status(200).json({ totalAmount });
  } catch (error) {
      console.error("Error retrieving total payment:", error);
      res.status(500).json({ message: "Error retrieving total payment" });
  }
});


app.get('/payment/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log(`Received startDate: ${startDate}, endDate: ${endDate}`);

    let query = {};

    // Nếu có startDate và endDate, thêm điều kiện vào query
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      console.log(`Parsed start date: ${start}, end date: ${end}`);

      query.paymentDate = {
        $gte: start,
        $lte: end
      };
    }

    // Tìm các khoản thanh toán trong khoảng thời gian
    const payments = await Payment.find(query).populate('userId');

    // Tính tổng số tiền kiếm được trong khoảng thời gian
    const totalAmount = await Payment.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalEarned = totalAmount.length > 0 ? totalAmount[0].total : 0;

    console.log(`Found payments: ${JSON.stringify(payments)}`);
    console.log(`Total earned in date range: ${totalEarned}`);

    res.status(200).json({ payments, totalEarned });
  } catch (error) {
    console.error("Error retrieving payments by date range:", error);
    res.status(500).json({ message: "Error retrieving payments by date range", error: error.message });
  }
});




app.get('/totalpayment/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate và endDate là bắt buộc" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Định dạng ngày không hợp lệ. Sử dụng định dạng YYYY-MM-DD." });
    }

    // Đảm bảo endDate bao gồm cả ngày cuối cùng
    end.setHours(23, 59, 59, 999);

    const result = await Payment.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: start,
            $lte: end
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const totalAmount = result.length > 0 ? result[0].totalAmount : 0;

    res.status(200).json({ totalAmount });
  } catch (error) {
    console.error("Error retrieving total payment by date range:", error);
    res.status(500).json({ message: "Error retrieving total payment by date range", error: error.message });
  }
});

  

  // Get Payments by User ID
app.get('/payments/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
  
      const payments = await Payment.find({ userId });
      if (!payments || payments.length === 0) {
        return res.status(204).json({ message: "No payments found for this user" });
      }
  
      res.status(200).json({ payments });
    } catch (error) {
      console.error("Error retrieving payments:", error);
      res.status(500).json({ message: "Error retrieving payments" });
    }
  });
  app.get('/get-userid-by-email', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Tìm kiếm người dùng dựa trên email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Trả về `userId`
        res.status(200).json({ userId: user._id });
    } catch (error) {
        console.error("Error retrieving user by email:", error);
        res.status(500).json({ message: "Error retrieving user by email" });
    }
});


  

const path = require('path');
const PDFDocument = require('pdfkit');
const docx = require('docx'); // Make sure to install `docx` package

// Route to download result as TXT
app.get('/downloadResult/txt/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const result = await Result.findOne({ documentId });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const downloadDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    const filePath = path.join(downloadDir, `${documentId}.txt`);
    fs.writeFileSync(filePath, result.ocrText);

    res.download(filePath, `${documentId}.txt`, (err) => {
      if (err) {
        console.error("Error sending TXT file:", err);
        res.status(500).json({ message: "Error sending file" });
      }
      fs.unlinkSync(filePath); // Clean up the file after sending
    });
  } catch (error) {
    console.error("Error downloading result as TXT:", error);
    res.status(500).json({ message: "Error downloading result" });
  }
});

// Route to download result as PDF
app.get('/downloadResult/pdf/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const result = await Result.findOne({ documentId });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const downloadDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    const filePath = path.join(downloadDir, `${documentId}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));
    doc.text(result.ocrText);
    doc.end();

    doc.on('finish', () => {
      res.download(filePath, `${documentId}.pdf`, (err) => {
        if (err) {
          console.error("Error sending PDF file:", err);
          res.status(500).json({ message: "Error sending file" });
        }
        fs.unlinkSync(filePath); // Clean up the file after sending
      });
    });
  } catch (error) {
    console.error("Error downloading result as PDF:", error);
    res.status(500).json({ message: "Error downloading result" });
  }
});

// Route to download result as DOCX
app.get('/downloadResult/docx/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const result = await Result.findOne({ documentId });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const downloadDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    const filePath = path.join(downloadDir, `${documentId}.docx`);
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: [
            new docx.Paragraph({
              children: [
                new docx.TextRun(result.ocrText),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await docx.Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    res.download(filePath, `${documentId}.docx`, (err) => {
      if (err) {
        console.error("Error sending DOCX file:", err);
        res.status(500).json({ message: "Error sending file" });
      }
      fs.unlinkSync(filePath); // Clean up the file after sending
    });
  } catch (error) {
    console.error("Error downloading result as DOCX:", error);
    res.status(500).json({ message: "Error downloading result" });
  }
});


app.post("/feedback",async (req,res) => {
  try{
    const {userId, content} = req.body;
    if (!userId || !content){
      return res.status(400).json({message:"UserId or content is not valid"});
    }
    const newFeedback = new Feedback({userId,content});
    await newFeedback.save();
    res.status(201).json({message:"sended", feedback: newFeedback});
  }catch(error){
    res.status(500).json({message:"failded", error});
  }
});
app.get("/feedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
    .populate('userId', 'email')
    .sort({ uploadedAt: -1 });
    res.status(200).json({ message: "success", feedbacks }); // Trả về danh sách feedback
  } catch (error) {
    res.status(500).json({ message: "failed", error }); // Xử lý lỗi
  }
});

app.put("/feedback/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const { content } = req.body;

      const feedback = await Feedback.findById(id);
      if (!feedback) {
          return res.status(404).json({ message: "Feedback not found" });
      }

      if (content) {
          feedback.content = content;
      }

      await feedback.save();
      res.status(200).json({ message: "Feedback updated successfully", feedback });
  } catch (error) {
      res.status(500).json({ message: "Failed to update feedback", error });
  }
});

// Delete Feedback
app.delete("/feedback/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const feedback = await Feedback.findById(id);
      if (!feedback) {
          return res.status(404).json({ message: "Feedback not found" });
      }

      await feedback.remove();
      res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Failed to delete feedback", error });
  }
});



app.get('/feedback/time-range', async (req, res) => {
  try {
    // Lấy startDate và endDate từ query parameters
    const { startDate, endDate } = req.query;

    // Chuyển đổi các tham số ngày tháng
    const start = startDate ? new Date(startDate) : new Date(0); // Mặc định bắt đầu từ ngày đầu tiên nếu không có startDate
    const end = endDate ? new Date(endDate) : new Date(); // Mặc định đến thời điểm hiện tại nếu không có endDate

    // Tìm feedback theo khoảng thời gian
    const feedbacks = await Feedback.find({
      uploadedAt: {
        $gte: start,
        $lte: end
      }
    }).populate('userId');

    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error("Error retrieving feedbacks by date range:", error);
    res.status(500).json({ message: "Error retrieving feedbacks by date range", error: error.message });
  }
});