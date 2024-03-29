import { withMainActivity } from '@expo/config-plugins';
import type { ConfigPlugin } from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

const withAndroidMainActivityImport: ConfigPlugin = (config) => {
  // @ts-ignore
  const newConfig = withMainActivity(config, (oldConfig) => {
    const newSrc = [
      'import android.view.KeyEvent;',
      'import com.expoexternalscanner.ExpoExternalScannerModule;',
    ];
    const mergeConfig = mergeContents({
      tag: 'react-native-keyevent-import',
      src: oldConfig.modResults.contents,
      newSrc: newSrc.join('\n'),
      anchor: `;`,
      offset: 1,
      comment: '//',
    });
    return {
      ...oldConfig,
      modResults: mergeConfig,
    };
  });
  return newConfig;
};
const withAndroidMainActivityBody: ConfigPlugin = (config) => {
  // @ts-ignore
  const newConfig = withMainActivity(config, (oldConfig) => {
    const newSrc = [
      '',
      '@Override',
      'public boolean dispatchKeyEvent(KeyEvent event) {',
      '  if (!ExpoExternalScannerModule.getInstance().isInputFromScanner(this, event)) {',
      '    return super.dispatchKeyEvent(event);',
      '  }',
      '  ExpoExternalScannerModule.getInstance().checkLetterStatus(event);',
      '  int action = event.getAction();',
      '  switch (action) {',
      '    case KeyEvent.ACTION_DOWN:',
      '      if (!ExpoExternalScannerModule.getInstance().excludedKeys.contains(event.getKeyCode())) {',
      '        ExpoExternalScannerModule.getInstance().append(event);',
      '      }',
      '      if (ExpoExternalScannerModule.getInstance().ingnoreKeys.contains(event.getKeyCode())) {',
      '        return super.dispatchKeyEvent(event);',
      '      }',
      '      ',
      '      if (ExpoExternalScannerModule.getInstance().isConfirmKey(event.getKeyCode())) {',
      '        ExpoExternalScannerModule.getInstance().onScannerEnd();',
      '      }',
      '      return true;',
      '    default:',
      '      break;',
      '  }',
      '  return super.dispatchKeyEvent(event);',
      '}',
    ];
    const mergeConfig = mergeContents({
      tag: 'react-native-keyevent-body',
      src: oldConfig.modResults.contents,
      newSrc: newSrc.join('\n'),
      anchor: `public class MainActivity extends ReactActivity {`,
      offset: 1,
      comment: '//',
    });
    return {
      ...config,
      modResults: mergeConfig,
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
