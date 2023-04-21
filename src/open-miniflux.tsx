import { getPreferenceValues, open } from "@raycast/api";
import { Preferences } from "./utils/types";

export default function OpenMiniflux() {
  const { baseUrl } = getPreferenceValues<Preferences>();
  open(baseUrl);
}