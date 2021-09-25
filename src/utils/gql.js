import { GRAPH_URL } from "../config/constants/graph";

export async function request(query, variables = {}, url = GRAPH_URL) {
    const _ = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        query,
        variables,
      }),
    });
  
    const {data} = await _.json();
  
    return data;
  }