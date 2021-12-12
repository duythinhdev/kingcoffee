/********* ZaloPayPlugin.m Cordova Plugin Implementation *******/

#import <Cordova/CDV.h>
#import <zpdk/zpdk.h>
@interface ZaloPayPlugin : CDVPlugin<ZPPaymentDelegate> {
  // Member variables go here.
    NSString* _callbackId;
}


- (void)payOrder:(CDVInvokedUrlCommand*)command;
@end
NSString *const STATUS_SUCESS = @"1";
NSString *const STATUS_FAILED = @"-1";
NSString *const STATUS_CANCELED = @"4";

@implementation ZaloPayPlugin

- (void)payOrder:(CDVInvokedUrlCommand*)command
{
    NSString* zpTransToken = [command.arguments objectAtIndex:0];
    [ZaloPaySDK sharedInstance].paymentDelegate = self; //Depend on where you handle ZPPaymentDelegate.
    [[ZaloPaySDK sharedInstance] payOrder:zpTransToken];
    _callbackId = command.callbackId;
}

- (void)paymentDidSucceeded:(NSString *)transactionId zpTranstoken:(NSString *)zpTranstoken appTransId:(NSString *)appTransId {
    //Handle Success
    printf("Payment Sucess");
    NSDictionary *resultData = @{@"transactionId": transactionId, @"zpTranstoken": zpTranstoken, @"appTransId": appTransId, @"status": STATUS_SUCESS};
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:resultData];
    [result setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:_callbackId];
}
- (void)paymentDidCanceled:(NSString *)zpTranstoken appTransId:(NSString *)appTransId {
    // Handle Canceled
    printf("Payment Canceled");
    NSDictionary *resultData = @{@"zpTranstoken": zpTranstoken, @"appTransId": appTransId, @"status": STATUS_CANCELED};
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:resultData];
    [result setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:_callbackId];
}
- (void)paymentDidError:(ZPPaymentErrorCode)errorCode zpTranstoken:(NSString *)zpTranstoken appTransId:(NSString *)appTransId {
  // Handle Error
    printf("Payment Failed");
    NSDictionary *resultData = @{@"zpTranstoken": zpTranstoken, @"appTransId": appTransId, @"status": STATUS_FAILED};
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:resultData];
    [result setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:_callbackId];
}
@end
