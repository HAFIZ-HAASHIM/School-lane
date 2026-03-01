const { db, admin } = require('./config/firebase');

const classes = [
    { id: 'class_1', name: 'Grade 12-A', subject: 'Mathematics' },
    { id: 'class_2', name: 'Grade 11-B', subject: 'Physics' }
];

const students = [
    { id: 'stu_1', name: 'Aarav Patel', rollNo: '12A-01', classId: 'class_1', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 'stu_2', name: 'Diya Sharma', rollNo: '12A-02', classId: 'class_1', avatar: 'https://i.pravatar.cc/150?img=12' },
    { id: 'stu_3', name: 'Rohan Gupta', rollNo: '12A-03', classId: 'class_1', avatar: 'https://i.pravatar.cc/150?img=13' },
    { id: 'stu_4', name: 'Isha Singh', rollNo: '12A-04', classId: 'class_1', avatar: 'https://i.pravatar.cc/150?img=14' },
    { id: 'stu_5', name: 'Kabir Das', rollNo: '11B-01', classId: 'class_2', avatar: 'https://i.pravatar.cc/150?img=15' }
];

const assignments = [
    { id: 'asg_1', title: 'Chapter 4 Integration Exercises', description: 'Complete all odd numbered problems on page 142.', classId: 'class_1', dueDate: '2026-10-25T23:59:59Z', type: 'homework', points: 50, createdAt: new Date().toISOString(), status: 'active' },
    { id: 'asg_2', title: 'Kinematics Lab Report', description: 'Submit the final PDF of your lab report.', classId: 'class_2', dueDate: '2026-10-28T23:59:59Z', type: 'project', points: 100, createdAt: new Date().toISOString(), status: 'active' },
    { id: 'asg_3', title: 'Midterm Prep Quiz', description: 'Online multiple choice quiz.', classId: 'class_1', dueDate: '2026-10-22T23:59:59Z', type: 'quiz', points: 20, createdAt: new Date().toISOString(), status: 'active' }
];

async function seed() {
    console.log('Seeding classes...');
    for (const c of classes) {
        await db.collection('classes').doc(c.id).set(c);
    }

    console.log('Seeding students...');
    for (const s of students) {
        await db.collection('students').doc(s.id).set(s);
    }

    console.log('Seeding assignments...');
    for (const a of assignments) {
        await db.collection('assignments').doc(a.id).set(a);
    }

    console.log('Seeding complete!');
    process.exit(0);
}

seed().catch(console.error);
