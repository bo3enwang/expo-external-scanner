import {
  ConfigPlugin,
  withAppDelegate,
  withMainActivity,
} from "@expo/config-plugins";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";

const withAndroidMainActivityImport: ConfigPlugin = (config) => {
  // @ts-ignore
  const newConfig = withMainActivity(config, (config) => {
    const newSrc = [
      "import android.view.KeyEvent;",
      "import com.expoexternalscanner.ExpoExternalScannerModule;",
    ];
    const newConfig = mergeContents({
      tag: "react-native-keyevent-import",
      src: config.modResults.contents,
      newSrc: newSrc.join("\n"),
      anchor: `;`,
      offset: 1,
      comment: "//",
    });
    return {
      ...config,
      modResults: newConfig,
    };
  });
  return newConfig;
};
const withAndroidMainActivityBody: ConfigPlugin = (config) => {
  // @ts-ignore
  const newConfig = withMainActivity(config, (config) => {
    const newSrc = [
      "private ExpoExternalScannerModule externalScannerModule = KeyEventModule.getInstance();",
      "",
      "",
      "@Override",
      "public boolean dispatchKeyEvent(KeyEvent event) {",
      "  if (!externalScannerModule.isInputFromScanner(this, event)) {",
      "    return super.dispatchKeyEvent(event);",
      "  }",
      "  int action = event.getAction();",
      "  switch (action) {",
      "    case KeyEvent.ACTION_DOWN:",
      "      if (!externalScannerModule.excludedKeys.contains(event.getKeyCode())) {",
      "        externalScannerModule.append(event);",
      "      }",
      "      if (externalScannerModule.ingnoreKeys.contains(event.getKeyCode())) {",
      "        return super.dispatchKeyEvent(event);",
      "      }",
      "      if (externalScannerModule.isConfirmKey(event.getKeyCode())) {",
      "        externalScannerModule.onScannerEnd()",
      "      }",
      "      return true;",
      "    default:",
      "      break;",
      "  }",
      "  return super.dispatchKeyEvent(event);",
      "}",
    ];
    const newConfig = mergeContents({
      tag: "react-native-keyevent-body",
      src: config.modResults.contents,
      newSrc: newSrc.join("\n"),
      anchor: `public class MainActivity extends ReactActivity {`,
      offset: 1,
      comment: "//",
    });
    return {
      ...config,
      modResults: newConfig,
    };
  });
  return newConfig;
};

const initPlugin: ConfigPlugin = (config) => {
  config = withAndroidMainActivityImport(config);
  config = withAndroidMainActivityBody(config);
  return config;
};

export default initPlugin;
