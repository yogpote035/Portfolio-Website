import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminResumes from './pages/AdminResumes.jsx';
import AdminSkills from './pages/AdminSkills.jsx';
import AdminProjects from './pages/AdminProjects.jsx';
import AdminProfile from './pages/AdminProfile.jsx';
import AdminExperience from './pages/AdminExperience.jsx';
import AdminEducation from './pages/AdminEducation.jsx';
import AdminContacts from './pages/AdminContacts.jsx';
import AdminContentHistory from './pages/AdminContentHistory.jsx';

function AdminApp() {
    return (
        <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route
                element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="/profile" element={<AdminProfile />} />
                <Route path="/profile/edit" element={<AdminProfile />} />
                <Route path="/profile/history" element={<AdminContentHistory entityType="profile" backTo="/profile" />} />
                <Route path="/projects" element={<AdminProjects />} />
                <Route path="/projects/new" element={<AdminProjects />} />
                <Route path="/projects/:id" element={<AdminProjects />} />
                <Route path="/projects/:id/edit" element={<AdminProjects />} />
                <Route path="/projects/:id/history" element={<AdminContentHistory entityType="project" backTo="/projects" />} />
                <Route path="/skills" element={<AdminSkills />} />
                <Route path="/skills/new" element={<AdminSkills />} />
                <Route path="/skills/:id" element={<AdminSkills />} />
                <Route path="/skills/:id/edit" element={<AdminSkills />} />
                <Route path="/skills/:id/history" element={<AdminContentHistory entityType="skill" backTo="/skills" />} />
                <Route path="/experience" element={<AdminExperience />} />
                <Route path="/experience/new" element={<AdminExperience />} />
                <Route path="/experience/:id" element={<AdminExperience />} />
                <Route path="/experience/:id/edit" element={<AdminExperience />} />
                <Route path="/experience/:id/history" element={<AdminContentHistory entityType="experience" backTo="/experience" />} />
                <Route path="/education" element={<AdminEducation />} />
                <Route path="/education/new" element={<AdminEducation />} />
                <Route path="/education/:id" element={<AdminEducation />} />
                <Route path="/education/:id/edit" element={<AdminEducation />} />
                <Route path="/education/:id/history" element={<AdminContentHistory entityType="education" backTo="/education" />} />
                <Route path="/contacts" element={<AdminContacts />} />
                <Route path="/contacts/:id" element={<AdminContacts />} />
                <Route path="/resumes" element={<AdminResumes />} />
                <Route path="/resumes/:id" element={<AdminResumes />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AdminApp;
