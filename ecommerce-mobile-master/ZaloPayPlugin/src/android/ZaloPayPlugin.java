import android.content.Intent;
import android.util.Log;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import vn.zalopay.sdk.ZaloPayError;
import vn.zalopay.sdk.ZaloPaySDK;
import vn.zalopay.sdk.listeners.PayOrderListener;

/**
 * This class echoes a string called from JavaScript.
 */
public class ZaloPayPlugin extends CordovaPlugin {
  public static final String SUCCESS = "1";
  public static final String CANCELED = "4";
  public static final String FAILED = "-1";

  @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("payOrder")) {
            String message = args.getString(0);
            this.payOrder(message, callbackContext);
            return true;
        }
        return false;
    }

    private void payOrder(String message, CallbackContext callbackContext) {
      Log.d("newIntent", "payOrder");
        if (message != null && message.length() > 0) {
          ZaloPaySDK.getInstance().payOrder(cordova.getActivity(), message, "tniecommerce://", new PayOrderListener() {
            @Override
            public void onPaymentSucceeded(String s, String s1, String s2) {
              Log.d("newIntent", "Success");
              JSONObject result = new JSONObject();
              try {
                result.put("status", SUCCESS);
              } catch (JSONException e) {
                e.printStackTrace();
              }
              PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, result);
              pluginResult.setKeepCallback(true);
              callbackContext.sendPluginResult(pluginResult);
            }

            @Override
            public void onPaymentCanceled(String s, String s1) {
              Log.d("newIntent", "Canceled");
              JSONObject result = new JSONObject();
              try {
                result.put("status", CANCELED);
              } catch (JSONException e) {
                e.printStackTrace();
              }
              PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, result);
              pluginResult.setKeepCallback(true);
              callbackContext.sendPluginResult(pluginResult);
            }

            @Override
            public void onPaymentError(ZaloPayError zaloPayError, String s, String s1) {
              Log.d("newIntent", "Error");
              JSONObject result = new JSONObject();
              try {
                result.put("status", FAILED);
              } catch (JSONException e) {
                e.printStackTrace();
              }
              PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, result);
              pluginResult.setKeepCallback(true);
              callbackContext.sendPluginResult(pluginResult);
            }
          });
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }
}
