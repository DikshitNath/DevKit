import { ThemeProvider } from './context/ThemeContext'
import ApiTester from './components/ApiTester'

export default function App() {
  return (
    <ThemeProvider>
      <ApiTester />
    </ThemeProvider>
  )
}