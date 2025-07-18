import { useState } from 'react'
import AddSchedule from './pages/AddSchedule'
import Dashboard from './pages/Dashboard'
import ScheduleList from './pages/ScheduleList'
import Login from './pages/Login'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login')

  const navigate = (page) => {
    setCurrentPage(page)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onNavigate={navigate} />
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />
      case 'addSchedule':
        return <AddSchedule onNavigate={navigate} />
      case 'scheduleList':
        return <ScheduleList onNavigate={navigate} />
      default:
        return <Login onNavigate={navigate} />
    }
  }

  return (
    <div className="App">
      {renderPage()}
    </div>
  )
}

export default App
