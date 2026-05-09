import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';

let dashboardChartsRegistered = false;

export function ensureDashboardChartsRegistered() {
    if (dashboardChartsRegistered) {
        return;
    }

    ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Tooltip, Legend);
    dashboardChartsRegistered = true;
}

ensureDashboardChartsRegistered();
