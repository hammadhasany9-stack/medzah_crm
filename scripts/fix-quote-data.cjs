const fs = require("fs");
const p = "e:/Medzah-Nexkara/medzah_crm/app/[tenant]/quotes/create/page.tsx";
let t = fs.readFileSync(p, "utf8");
const anchor = "      termsAndConditions: \"\",\n      description,";
if (!t.includes(anchor)) throw new Error("anchor not found");
const insert = `      paymentTerms: "",
      expectedDemand: "",
      deliveryLocations: "",
      deliveryLocationCount: "",
      firstOrderDeliveryDate: "",
      freightResponsibility: "",
      deliveryCharges: "",
      carrierBillingMethod: "",
      customerShippingAccountNumber: "",
      overheadInfrastructurePercent: "25",
      salesCommissionPercent: "",
      freightCostAmount: "",
      overheadAmount: "",
      salesCommissionAmount: "",
      finalQuoteTotal: grandTotal,
`;
t = t.replace(anchor, insert + anchor);
fs.writeFileSync(p, t, "utf8");
console.log("patched quote create");
