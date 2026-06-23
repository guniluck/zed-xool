const express = require('express');
const path = require('path');
const db = require('./database');
require('dotenv').config();

const app = express();
app.use(express.json());

// Serve static frontend layouts from /public
app.use(express.static(path.join(__dirname, 'public')));

// Serve admin file folder explicitly
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// --- AUTHENTICATION ROUTERS ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { role, fname, lname, phone, email, pass, formGradeVal, className } = req.body;
        const prefix = role === 'pupil' ? 'PPL' : role === 'teacher' ? 'TCH' : 'PAR';
        const uniqueId = prefix + Math.floor(1000 + Math.random() * 9000);

        await db.execute(
            `INSERT INTO users (uid, role, first_name, last_name, phone, email, password, form_grade, class_name) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uniqueId, role, fname, lname, phone, email || null, pass, formGradeVal || null, className || null]
        );
        res.json({ success: true, user_uid: uniqueId });
    } catch (err) {
        res.status(500).json({ success: false, message: "Registration failed or duplicate entry: " + err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { role, credential, password } = req.body;
        const [rows] = await db.execute(
            `SELECT * FROM users WHERE role = ? AND (uid = ? OR email = ? OR phone = ?) AND password = ?`,
            [role, credential, credential, credential, password]
        );

        if (rows.length > 0) {
            const user = rows[0];
            res.json({
                success: true,
                user: { uid: user.uid, role: user.role, firstName: user.first_name, lastName: user.last_name, formGradeVal: user.form_grade, className: user.class_name }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid system credentials." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- ADMIN SYSTEM MANAGEMENT DATA ---
app.get('/api/admin/accounts', async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT uid, role, first_name, last_name, email, phone, form_grade, class_name, created_at FROM users ORDER BY id DESC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        const [[pupils]] = await db.execute(`SELECT COUNT(*) as count FROM users WHERE role='pupil'`);
        const [[teachers]] = await db.execute(`SELECT COUNT(*) as count FROM users WHERE role='teacher'`);
        const [[assignments]] = await db.execute(`SELECT COUNT(*) as count FROM assignments`);
        res.json({ pupils: pupils.count, teachers: teachers.count, assignments: assignments.count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ACADEMIC SYLLABUS DISPATCHERS ---
app.post('/api/assignments', async (req, res) => {
    try {
        const { title, body, type, assignedBy, targetGrade, targetClass } = req.body;
        await db.execute(
            `INSERT INTO assignments (title, body, type, assigned_by, target_grade, target_class) VALUES (?, ?, ?, ?, ?, ?)`,
            [title, body, type, assignedBy, targetGrade, targetClass]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/assignments', async (req, res) => {
    try {
        const { grade, className } = req.query;
        const [rows] = await db.execute(
            `SELECT * FROM assignments WHERE target_grade = ? AND target_class = ? ORDER BY id DESC`,
            [grade, className]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MESSAGE ROUTERS ---
app.post('/api/messages', async (req, res) => {
    try {
        const { senderUid, receiverUid, content } = req.body;
        await db.execute(`INSERT INTO messages (sender_uid, receiver_uid, message_content) VALUES (?, ?, ?)`, [senderUid, receiverUid, content]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/messages/:uid', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT m.*, u.first_name FROM messages m JOIN users u ON m.sender_uid = u.uid 
             WHERE m.sender_uid = ? OR m.receiver_uid = ? ORDER BY m.id ASC`,
            [req.params.uid, req.params.uid]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MMSS Portal Operating Securely on Port http://localhost:${PORT}`));