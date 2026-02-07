import type { IconSymbolName } from "@/components/ui/icon-symbol";

export type ServiceItemConfig = {
  id: string;
  label: string;
  iconName: IconSymbolName;
  image: any;
  url: string;
  color: string;
};

export const SERVICES: ServiceItemConfig[] = [
  {
    id: "dnd",
    label: "DND",
    iconName: "nosign",
    image: require("@/assets/images/icons/dnd.png"),
    url: "https://dnd.completeselular.com",
    color: "#3b82f6",
  },
  {
    id: "sumo",
    label: "SUMO",
    iconName: "cart.fill",
    image: require("@/assets/images/icons/sumo.png"),
    url: "https://sumo.completeselular.com/",
    color: "#3b82f6",
  },
  {
    id: "helpdesk",
    label: "Helpdesk",
    iconName: "headphones",
    image: require("@/assets/images/icons/helpdesk.png"),
    url: "https://helpdesk.completeselular.com",
    color: "#3b82f6",
  },
  {
    id: "lead",
    label: "LEAD",
    iconName: "scope",
    image: require("@/assets/images/icons/lead.png"),
    url: "http://lead.completeselular.com/",
    color: "#3b82f6",
  },
  {
    id: "shelf",
    label: "Shelf",
    iconName: "shippingbox.fill",
    image: require("@/assets/images/icons/shelf.png"),
    url: "https://shelf.completeselular.com/",
    color: "#3b82f6",
  },
  {
    id: "attendance",
    label: "Attendance",
    iconName: "clock.fill",
    image: require("@/assets/images/icons/attendance.png"),
    url: "/presensi",
    color: "#3b82f6",
  },
  {
    id: "form-transfer",
    label: "Form Transfer",
    iconName: "arrow.left.arrow.right",
    image: require("@/assets/images/icons/transfer.png"),
    url: "/form-transfer",
    color: "#3b82f6",
  },
  {
    id: "lainnya",
    label: "Lainnya",
    iconName: "ellipsis",
    image: require("@/assets/images/icons/more.png"),
    url: "",
    color: "#3b82f6",
  },
];
