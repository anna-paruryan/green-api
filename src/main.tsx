import {createRoot} from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import "@radix-ui/themes/styles.css"
createRoot(document.getElementById('root')!).render(
    <App/>
)
