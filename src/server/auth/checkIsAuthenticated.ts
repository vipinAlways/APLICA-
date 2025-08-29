"use server";

import { auth } from "./index";

export async function checkIsAuthenticated() {
  const session = await auth();
  if (session) {
    return true;
  } else {
    return false;
  }
}
