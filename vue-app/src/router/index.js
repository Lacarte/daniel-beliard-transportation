import { createRouter, createWebHistory } from 'vue-router'
import LoadManager from '../pages/LoadManager.vue'
import Dashboard from '../pages/Dashboard.vue'
import Reports from '../pages/Reports.vue'
import PayStub from '../pages/PayStub.vue'
import History from '../pages/History.vue'
import Settings from '../pages/Settings.vue'

const routes = [
  { path: '/', name: 'loadmanager', component: LoadManager },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/reports', name: 'reports', component: Reports },
  { path: '/paystub', name: 'paystub', component: PayStub },
  { path: '/history', name: 'history', component: History },
  { path: '/settings', name: 'settings', component: Settings },
]

export default createRouter({ history: createWebHistory(), routes })
