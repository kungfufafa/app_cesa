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
  SwitchCamera,
  X,
  Calendar,
  Plus,
  Briefcase,
  FileText,
  RefreshCw,
  Users,
  Inbox,
  Ban,
  ShoppingCart,
  Headphones,
  Target,
  Package,
  Megaphone,
  MoreHorizontal,
  ArrowLeftRight,
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
interopIcon(SwitchCamera);
interopIcon(X);
interopIcon(Calendar);
interopIcon(Plus);
interopIcon(Briefcase);
interopIcon(FileText);
interopIcon(RefreshCw);
interopIcon(Users);
interopIcon(Inbox);
interopIcon(Ban);
interopIcon(ShoppingCart);
interopIcon(Headphones);
interopIcon(Target);
interopIcon(Package);
interopIcon(Megaphone);
interopIcon(MoreHorizontal);
interopIcon(ArrowLeftRight);
