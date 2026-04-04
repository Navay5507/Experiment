import Razorpay from "razorpay";

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  console.warn("⚠️ [RAZORPAY_INIT]: KEY_ID or KEY_SECRET is missing. Payment creation will fail.");
}

export const razorpay = new Razorpay({
  key_id: key_id || "rzp_test_mock",
  key_secret: key_secret || "mock_secret",
});
