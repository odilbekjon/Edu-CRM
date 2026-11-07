import { Navigate, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Layout } from "./layouts/layout";
import { PublicOnly, RequireAuth, RequireRole } from "./components/RouteGuards";
import { NotFound } from "./pages/NotFound";
import { Budget } from "./pages/Budget";
import { Teachers } from "./pages/Teachers/Teachers";
import { Leads } from "./pages/Leads/Leads";
import { Groups } from "./pages/Groups/Groups";
import { Students } from "./pages/Students/Students";
import { StudentProfile } from "./pages/StudentProfile/StudentProfile";
import { Reminders } from "./pages/Reminders";
import SignUp from "./pages/SignUp/SignUp";
import LoginPage from "./pages/Login/Login";
import Profile  from "./pages/Profile/Profile";
import { Notifications } from "./pages/Notifications/Notifications";
import { SingleGroup } from "./pages/SingleGroup";
import { TeacherProfile } from "./pages/TeacherProfile";
import { Rating } from "./pages/Rating";
import { TeacherAttendanceReport } from "./pages/TeacherAddanceReport";
import { AttendanceReport } from "./pages/AttandanceReport";
import { Settings } from "./pages/Settings/Settings";
import { SettingsSms } from "./pages/Settings/pages/sms";
import { Grade } from "./pages/Settings/pages/grade";
import { Voip } from "./pages/Settings/pages/voip";
import { CEO } from "./pages/Settings/ceo/ceo";
import { General } from "./pages/Settings/ceo/pages/general";
import { Staff } from "./pages/Settings/ceo/pages/staff";
import { Roadmap } from "./pages/Settings/ceo/pages/roadmap";
import { Billing } from "./pages/Settings/ceo/pages/billing";
import { Office } from "./pages/Settings/office/office";
import { Courses } from "./pages/Settings/office/pages";
import { SingleCourse } from "./pages/SingleCourse";
import { Rooms } from "./pages/Settings/office/pages";
import { Holidays } from "./pages/Settings/office/pages";
import { StudentLeft } from "./pages/Settings/office/pages";
import { Archive } from "./pages/Settings/office/pages";
import { Forms } from "./pages/Settings/forms";
import { Lists } from "./pages/Settings/forms/pages";
import { CreateForm } from "./pages/Settings/forms/pages/createForm";
import { Blog } from "./pages/Settings/blog";
import { WhatsNew } from "./pages/Settings/blog/pages";
import { BlogAdd } from "./pages/Settings/blog/pages/wahts-new/add";
import { Finance } from "./pages/Finance/Finance";
import { AllPayments } from "./pages/Finance/pages/AllPayments";
import { Withdraw } from "./pages/Finance/pages/Withdraw";
import { TotalExpenses } from "./pages/Finance/pages/TotalExpenses";
import { Salaries } from "./pages/Finance/pages/Salaries";
import { Debtors } from "./pages/Finance/pages/Debtors";
import { Reports } from "./pages/Reports/Reports";
import { AttendanceReports } from "./pages/Reports/pages/AttendenceReports";
import { ConversionReports } from "./pages/Reports/pages/ConversationReports";
import { LeadsReports } from "./pages/Reports/pages/LeadsReports";
import { StudentsLeftGroup } from "./pages/Reports/pages/StudentsLeftGroup";       
import { Logs } from "./pages/Reports/Logs";
import { Workly, Sms, Call, Log } from "./pages/Reports/Logs/pages";
import { Tags } from "./pages/Settings/tags";
import { Tag } from "./pages/Settings/tags/pages/tag/tag";


export const AppRouter = () => {
   return(
    <Routes>
        <Route element={<PublicOnly />}>
            <Route path="/" element={<LoginPage/>} />
        </Route>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<SignUp/>} />

        <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route element={<RequireRole roles={["ceo","admin","manager"]} />}>
        <Route path="/leads" element={<Leads/>} />
        </Route>
        <Route path="/teachers" element={<Teachers/>} />
        <Route path="/teachers/:id" element={<TeacherProfile/>} />
        <Route path="/groups" element={<Groups/>} />
        <Route path="/groups/:id" element={<SingleGroup/>} />
        <Route path="/students" element={<Students/>} />
        <Route path="/students/:id" element={<StudentProfile/>} />
        <Route path="/courses/:id" element={<SingleCourse/>} />
        <Route path="/reminders" element={<Reminders/>} />
        <Route path="/rating" element={<Rating/>} />
        <Route element={<RequireRole roles={["ceo","admin","manager","accountant"]} />}>
        <Route path="/budget" element={<Budget/>} />
        </Route>
        <Route path="/profile" element={<Profile/>} />
        <Route path="/attendance-reports" element={<AttendanceReport/>} />
        <Route path="/teacher-attendance-reports" element={<TeacherAttendanceReport/>} />
        <Route path="/notifications" element={<Notifications/>} />

        <Route element={<RequireRole roles={["ceo","admin","manager"]} />}>
        <Route path="/settings" element={<Settings/>} >
            <Route path="sms" element={<SettingsSms/>}/>
            <Route path="grade" element={<Grade/>}/>
            <Route path="voip" element={<Voip/>}/>

            <Route path="ceo"             element={<CEO />} >
                <Route path="general"      element={<General />} />
                <Route path="roadmap"      element={<Roadmap />} />
                <Route path="staff"        element={<Staff />} />
                <Route path="billing"      element={<Billing />} />
            </Route>

            <Route path="office"             element={<Office />} >
                <Route path="courses"      element={<Courses />} />
                <Route path="archive"      element={<Archive />} />
                <Route path="rooms"      element={<Rooms />} />
                <Route path="holidays"        element={<Holidays />} />
                <Route path="students-left-group"      element={<StudentLeft />} />
            </Route>

            <Route path="forms"             element={<Forms />} >
                <Route path="list"      element={<Lists />} />
                <Route path="create" element={<CreateForm />} />
                <Route path="edit/:id" element={<CreateForm />} />
            </Route>

            <Route path="blog"             element={<Blog />} >
                <Route path="whats-new"      element={<WhatsNew />} />
                 <Route path="whats-new/add" element={<BlogAdd />} />
            </Route>

            <Route path="tags"             element={<Tags />} >
                <Route path="list"      element={<Tag />} />
            </Route>

        </Route>
        </Route>

        <Route element={<RequireRole roles={["ceo","admin","manager","accountant"]} />}>
        <Route path="/finance" element={<Finance/>}>
            <Route path="all-payments"   element={<AllPayments />} />
            <Route path="withdraw"       element={<Withdraw />} />
            <Route path="total-expenses" element={<TotalExpenses />} />
            <Route path="salaries"       element={<Salaries />} />
            <Route path="debtors"        element={<Debtors />} />
        </Route>
        </Route>

        <Route element={<RequireRole roles={["ceo","admin","manager"]} />}>
        <Route path="/reports" element={<Reports/>}>
            <Route path="conversation"   element={<ConversionReports />} />
            <Route path="attendance"     element={<AttendanceReports />} />
            <Route path="leads"            element={<LeadsReports />} />
            <Route path="students-left"    element={<StudentsLeftGroup />} />

            <Route path="logs"             element={<Logs />} >
                <Route path="workly"           element={<Workly />} />
                <Route path="sms"              element={<Sms />} />
                <Route path="call"             element={<Call />} />
                <Route path="log"              element={<Log />} />
            </Route>

        </Route>
        </Route>

        <Route path="*" element={<NotFound/>} />
        </Route>
        </Route>
    </Routes>
   )
}