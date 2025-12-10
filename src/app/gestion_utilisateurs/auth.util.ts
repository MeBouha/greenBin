export interface user {
  id: number;
  login: string;
  password: string;
  nom: string;
  prenom: string;
  role: string;
}

export async function validateUserCredentials(username: string, password: string): Promise<user | null> {
  try {
    const response = await fetch('/data/users.xml');
    const xmlText = await response.text();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    const users = xmlDoc.getElementsByTagName("user");
    
    for (let i = 0; i < users.length; i++) {
      const u = users[i];

      const userLogin = u.getElementsByTagName("login")[0]?.textContent?.trim();
      const userPassword = u.getElementsByTagName("password")[0]?.textContent?.trim();

      // id can be stored as attribute or as a child <id>
      const idAttr = u.getAttribute('id')?.toString().trim();
      const idChild = u.getElementsByTagName('id')[0]?.textContent?.trim();
      const idStr = idAttr || idChild || '';
      const idNum = parseInt(idStr || '0', 10) || 0;

      // accept username matching either login or id (as string)
      const usernameTrim = username?.toString().trim();
      const passwordTrim = password?.toString().trim();
      const usernameMatches = (userLogin && userLogin === usernameTrim) || (idStr && idStr === usernameTrim);

      if (usernameMatches && userPassword === passwordTrim) {
        return {
          id: idNum,
          login: userLogin || "",
          password: userPassword || "",
          nom: u.getElementsByTagName('nom')[0]?.textContent?.trim() || "",
          prenom: u.getElementsByTagName('prenom')[0]?.textContent?.trim() || "",
          role: u.getElementsByTagName('role')[0]?.textContent?.trim() || "",
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la validation des credentials:", error);
    return null;
  }
}
