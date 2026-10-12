import { NavLink, Route, Routes } from "react-router-dom";
import { navGroups } from "./nav";
import Home from "./pages/Home";

import VolcaniumProviderDoc from "./pages/config/VolcaniumProviderDoc";

import TitleDoc from "./pages/ui/TitleDoc";
import CheckListItemDoc from "./pages/ui/CheckListItemDoc";
import ButtonDoc from "./pages/ui/ButtonDoc";
import ContainerDoc from "./pages/ui/ContainerDoc";
import InformationButtonDoc from "./pages/ui/InformationButtonDoc";
import SelectDoc from "./pages/ui/SelectDoc";
import ModalDoc from "./pages/ui/ModalDoc";
import ToastDoc from "./pages/ui/ToastDoc";
import InDevDoc from "./pages/ui/InDevDoc";
import InputDoc from "./pages/ui/InputDoc";
import TableDoc from "./pages/ui/TableDoc";
import TooltipButtonDoc from "./pages/ui/TooltipButtonDoc";
import FormDoc from "./pages/ui/FormDoc";
import LinkDoc from "./pages/ui/LinkDoc";
import TextareaDoc from "./pages/ui/TextareaDoc";
import LoaderDoc from "./pages/ui/LoaderDoc";
import ToggleDoc from "./pages/ui/ToggleDoc";
import StepperDoc from "./pages/ui/StepperDoc";
import TabsDoc from "./pages/ui/TabsDoc";
import InfoCardDoc from "./pages/ui/InfoCardDoc";
import ConfirmModalDoc from "./pages/ui/ConfirmModalDoc";
import FullPageLoaderDoc from "./pages/ui/FullPageLoaderDoc";
import DatePickerDoc from "./pages/ui/DatePickerDoc";
import ThemeToggleDoc from "./pages/ui/ThemeToggleDoc";

import CenterDoc from "./pages/layout/CenterDoc";
import GridDoc from "./pages/layout/GridDoc";
import TopNavDoc from "./pages/layout/TopNavDoc";
import SidebarDoc from "./pages/layout/SidebarDoc";
import HeroDoc from "./pages/layout/HeroDoc";
import NavDoc from "./pages/layout/NavDoc";

export default function App() {
  return (
    <div className="flex min-h-screen bg-back text-text font-main">
      <aside className="w-64 shrink-0 border-r border-white/10 h-screen sticky top-0 overflow-y-auto p-4 flex flex-col gap-6">
        <NavLink to="/" className="text-lg font-title text-main">
          volcanium-components
        </NavLink>
        {navGroups.map((g, i) => (
          <div
            key={g.group}
            className={`flex flex-col gap-0.5 ${i > 0 ? "pt-4 border-t border-white/10" : ""}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary/60 px-2 mb-1.5">
              {g.group}
            </p>
            {g.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-2 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-container text-white"
                      : "text-white/70 hover:bg-container hover:text-secondary"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </aside>

      <main className="flex-1 p-8 sm:p-10 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/config/volcanium-provider"
            element={<VolcaniumProviderDoc />}
          />

          <Route path="/ui/title" element={<TitleDoc />} />
          <Route path="/ui/check-list-item" element={<CheckListItemDoc />} />
          <Route path="/ui/button" element={<ButtonDoc />} />
          <Route path="/ui/container" element={<ContainerDoc />} />
          <Route
            path="/ui/information-button"
            element={<InformationButtonDoc />}
          />
          <Route path="/ui/select" element={<SelectDoc />} />
          <Route path="/ui/modal" element={<ModalDoc />} />
          <Route path="/ui/toast" element={<ToastDoc />} />
          <Route path="/ui/in-dev" element={<InDevDoc />} />
          <Route path="/ui/input" element={<InputDoc />} />
          <Route path="/ui/table" element={<TableDoc />} />
          <Route path="/ui/tooltip-button" element={<TooltipButtonDoc />} />
          <Route path="/ui/form" element={<FormDoc />} />
          <Route path="/ui/link" element={<LinkDoc />} />
          <Route path="/ui/textarea" element={<TextareaDoc />} />
          <Route path="/ui/loader" element={<LoaderDoc />} />
          <Route path="/ui/toggle" element={<ToggleDoc />} />
          <Route path="/ui/stepper" element={<StepperDoc />} />
          <Route path="/ui/tabs" element={<TabsDoc />} />
          <Route path="/ui/info-card" element={<InfoCardDoc />} />
          <Route path="/ui/confirm-modal" element={<ConfirmModalDoc />} />
          <Route path="/ui/full-page-loader" element={<FullPageLoaderDoc />} />
          <Route path="/ui/date-picker" element={<DatePickerDoc />} />
          <Route path="/ui/theme-toggle" element={<ThemeToggleDoc />} />

          <Route path="/layout/center" element={<CenterDoc />} />
          <Route path="/layout/grid" element={<GridDoc />} />
          <Route path="/layout/top-nav" element={<TopNavDoc />} />
          <Route path="/layout/sidebar" element={<SidebarDoc />} />
          <Route path="/layout/hero" element={<HeroDoc />} />
          <Route path="/layout/nav" element={<NavDoc />} />
        </Routes>
      </main>
    </div>
  );
}
