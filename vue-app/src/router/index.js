import { createRouter, createWebHistory } from 'vue-router'
import LoadManager from '../pages/LoadManager.vue'
import Dashboard from '../pages/Dashboard.vue'
import Reports from '../pages/Reports.vue'
import PayStub from '../pages/PayStub.vue'
import History from '../pages/History.vue'
import Settings from '../pages/Settings.vue'

const routes = [
  { path: '/', name: 'loadmanager', component: LoadManager, meta: { label: 'Load Manager', icon: 'truck' } },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { label: 'Dashboard', icon: 'grid' } },
  { path: '/reports', name: 'reports', component: Reports, meta: { label: 'Reports', icon: 'chart' } },
  { path: '/paystub', name: 'paystub', component: PayStub, meta: { label: 'Pay Stub', icon: 'file' } },
  { path: '/history', name: 'history', component: History, meta: { label: 'Pay History', icon: 'activity' } },
  { path: '/settings', name: 'settings', component: Settings, meta: { label: 'Settings', icon: 'settings' } },
]

export default createRouter({ history: createWebHistory(), routes })
