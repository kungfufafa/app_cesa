import { cssInterop } from "nativewind";
import {
  Camera,
  MapPin,
  ChevronRight,
  House,
  Clock,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react-native";

/**
 * Configure Lucide icons for NativeWind support.
 * This maps the `className` prop to the `style` prop, and allows
 * Tailwind text colors (like `text-red-500`) to propagate to the icon's `color` prop.
 */
function interopIcon(icon: any) {
  cssInterop(icon, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  });
}

interopIcon(Camera);
interopIcon(MapPin);
interopIcon(ChevronRight);
interopIcon(House);
interopIcon(Clock);
interopIcon(User);
interopIcon(Settings);
interopIcon(HelpCircle);
interopIcon(LogOut);
