// `/sell` entry → the Dashboard (companion §2.3 default landing). Composition-only.
import { redirect } from "next/navigation";

export default function WorkspaceIndexPage() {
  redirect("/sell/dashboard");
}
