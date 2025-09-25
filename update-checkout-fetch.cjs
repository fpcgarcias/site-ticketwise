const fs = require('fs');
const path = 'src/pages/CheckoutPage.tsx';
let content = fs.readFileSync(path, 'utf8');
const oldSnippet = "      const response = await fetch('http://localhost:3001/api/stripe/checkout', {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json'\n        },\n        body: JSON.stringify({\n          price_id: priceId,\n          success_url: `${window.location.origin}/success`,\n          cancel_url: `${window.location.origin}/pricing?action=subscribe`,\n          customer_email: user?.email,\n          customer_data: {\n            email: user?.email,\n            name: user?.name,\n            couponCode: couponCode || undefined\n          }\n        })\n      });\n\n      const data = await response.json();\n      \n      if (data.success && data.url) {\n        window.location.href = data.url;\n      } else {\n        throw new Error(data.error || 'Erro ao criar sessuo de checkout');\n      }";
if (!content.includes(oldSnippet)) {
  throw new Error('old snippet not found');
}
const newSnippet = "      const data = await api.createCheckoutSession({\n        price_id: priceId,\n        success_url: `${window.location.origin}/success`,\n        cancel_url: `${window.location.origin}/pricing?action=subscribe`,\n        customer_email: user?.email,\n        customer_data: {\n          email: user?.email,\n          name: user?.name,\n          couponCode: couponCode || undefined\n        }\n      });\n\n      if (data.success && data.url) {\n        window.location.href = data.url;\n      } else {\n        throw new Error(data.error || 'Erro ao criar sessuo de checkout');\n      }";
content = content.replace(oldSnippet, newSnippet);
fs.writeFileSync(path, content);
