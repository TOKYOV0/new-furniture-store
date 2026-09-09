# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Shiprocket setup

1. Deploy `src/google-apps-script.gs` as a Web App with **Execute as me** and access **Anyone**, then configure its `/exec` URL in the admin Dashboard sales settings.
2. In Vercel, open **Project Settings -> Environment Variables** and add `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, and `SHIPROCKET_PICKUP_LOCATION`. Keep these server-only variables out of `VITE_*` variables.
3. Deploy from this project with `npm run deploy`, or connect the Git repository to Vercel for automatic deployments.
4. In **My account -> Address**, enter House/apartment, Street/area, City, State, and a six-digit PIN code separately. Checkout sends these fields directly to Shiprocket.
5. Customers can view shipment status in **My account -> Orders**. Admins can search orders and manage AWB/courier details in **Orders & shipping**.
