package com.expoexternalscanner;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import android.view.KeyEvent;
import android.view.InputDevice;
import android.content.res.Configuration;
import android.content.Context;
import androidx.annotation.NonNull;
import android.util.Log;

import com.facebook.react.ReactActivity;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

@ReactModule(name = ExpoExternalScannerModule.NAME)
public class ExpoExternalScannerModule extends ReactContextBaseJavaModule {
  public static final String NAME = "ExpoExternalScanner";

  private boolean mCaps;
  private StringBuilder scanCodeBuilder = new StringBuilder();

  private ReactContext mReactContext;
  private DeviceEventManagerModule.RCTDeviceEventEmitter mJSModule = null;
  private static ExpoExternalScannerModule instance = null;

  public static ExpoExternalScannerModule initModule(ReactApplicationContext reactContext) {
    instance = new ExpoExternalScannerModule(reactContext);
    return instance;
  }

  public static ExpoExternalScannerModule getInstance() {
    return instance;
  }

  public ExpoExternalScannerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    mReactContext = reactContext;
  }

  public final static Set<Integer> ingnoreKeys = new HashSet<>(Arrays.asList(
      KeyEvent.KEYCODE_VOLUME_UP,
      KeyEvent.KEYCODE_VOLUME_DOWN,
      KeyEvent.KEYCODE_BACK,
      KeyEvent.KEYCODE_MENU,
      KeyEvent.KEYCODE_HOME,
      KeyEvent.KEYCODE_POWER
  ));

  public final static Set<Integer> excludedKeys = new HashSet<>(Arrays.asList(
    KeyEvent.KEYCODE_SHIFT_RIGHT,
    KeyEvent.KEYCODE_SHIFT_LEFT,
    KeyEvent.KEYCODE_ENTER
  ));

  private char getInputCode(KeyEvent event) {
      int keyCode = event.getKeyCode();
      char aChar;
      if (keyCode >= KeyEvent.KEYCODE_A && keyCode <= KeyEvent.KEYCODE_Z) {
          aChar = (char) ((mCaps ? 'A' : 'a') + keyCode - KeyEvent.KEYCODE_A);
      } else if (keyCode >= KeyEvent.KEYCODE_0 && keyCode <= KeyEvent.KEYCODE_9) {
          aChar = (char) ('0' + keyCode - KeyEvent.KEYCODE_0);
      } else if (keyCode == KeyEvent.KEYCODE_ENTER) {
          aChar = 0;
      } else {
          aChar = (char) event.getUnicodeChar();
      }
      return aChar;
  }

  public void append(KeyEvent event) {
    char x = getInputCode(event);
    scanCodeBuilder.append(x);
  }

  public void onScannerEnd() {
    if (!mReactContext.hasActiveCatalystInstance()) {
        return;
    }
    if (mJSModule == null) {
        mJSModule = mReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    }
    mJSModule.emit("onExternalScan", getJsEventParams(scanCodeBuilder.toString()));
    if (scanCodeBuilder.length() > 0) {
      scanCodeBuilder.setLength(0);
    }
  };

  public boolean isInputFromScanner(Context context, KeyEvent event) {
    if (event.getDevice() == null) {
      return false;
    }
    int keyCode = event.getKeyCode();
    if (keyCode == KeyEvent.KEYCODE_BACK || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN || keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
      return false;
    }
    int sources = event.getDevice().getSources();
    // if ((sources & InputDevice.SOURCE_CLASS_BUTTON) != 0) {
    //   return false;
    // }
    Configuration cfg = context.getResources().getConfiguration();
    return cfg.keyboard != Configuration.KEYBOARD_UNDEFINED;
  }

  public void checkLetterStatus(KeyEvent event) {
    int keyCode = event.getKeyCode();
    if (keyCode == KeyEvent.KEYCODE_SHIFT_RIGHT || keyCode == KeyEvent.KEYCODE_SHIFT_LEFT) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            mCaps = true;
        } else {
            mCaps = false;
        }
    }
  }

  public static final boolean isConfirmKey(int keyCode) {
    switch (keyCode) {
        case KeyEvent.KEYCODE_DPAD_CENTER:
        case KeyEvent.KEYCODE_ENTER:
        case KeyEvent.KEYCODE_SPACE:
        case KeyEvent.KEYCODE_NUMPAD_ENTER:
            return true;
        default:
            return false;
    }
  }

  private WritableMap getJsEventParams(final String code) {
    WritableMap params = new WritableNativeMap();
    params.putString("scannerCode", code);
    return params;
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

}
