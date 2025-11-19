const FACEPP_BASE_URL =
  process.env.FACEPP_BASE_URL ?? "https://api-us.faceplusplus.com/facepp/v3";

type FacePPFace = {
  face_token: string;
  attributes?: Record<string, unknown>;
};

export type FacePPDetectResponse = {
  request_id: string;
  face_num: number;
  faces: FacePPFace[];
  time_used: number;
  image_id: string;
};

export type FacePPCreateFaceSetResponse = {
  faceset_token: string;
  outer_id: string;
  face_count: number;
  face_added: number;
  time_used: number;
  request_id: string;
};

export type FacePPAddFaceResponse = {
  faceset_token: string;
  outer_id: string;
  face_count: number;
  face_added: number;
  failure_detail?: Array<{ face_token: string; reason: string }>;
};

export type FacePPSearchResult = {
  confidence: number;
  face_token: string;
  user_id?: string;
};

export type FacePPSearchResponse = {
  request_id: string;
  time_used: number;
  faceset_token: string;
  results: FacePPSearchResult[];
  image_id: string;
  thresholds: Record<string, number>;
};

class FacePlusPlusError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "FacePlusPlusError";
    this.status = status;
  }
}

export class FacePPClient {
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = process.env.FACEPP_API_KEY ?? "";
    this.apiSecret = process.env.FACEPP_API_SECRET ?? "";

    if (!this.apiKey || !this.apiSecret) {
      throw new Error("Face++ credentials are missing");
    }
  }

  private appendAuth(form: FormData) {
    form.append("api_key", this.apiKey);
    form.append("api_secret", this.apiSecret);
  }

  private async postForm<T>(
    path: string,
    builder: (form: FormData) => void
  ): Promise<T> {
    const form = new FormData();
    this.appendAuth(form);
    builder(form);

    const response = await fetch(`${FACEPP_BASE_URL}/${path}`, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new FacePlusPlusError(text || "Face++ API error", response.status);
    }

    return response.json() as Promise<T>;
  }

  detectByFile(file: File): Promise<FacePPDetectResponse> {
    return this.postForm("detect", (form) => {
      form.append("image_file", file, file.name || "image.jpg");
      form.append("return_landmark", "1");
      form.append("return_attributes", "gender,age");
    });
  }

  createFaceSet(
    outerId: string,
    initialFaceToken: string
  ): Promise<FacePPCreateFaceSetResponse> {
    return this.postForm("faceset/create", (form) => {
      form.append("outer_id", outerId);
      form.append("face_tokens", initialFaceToken);
    });
  }

  addFaces(
    outerId: string,
    faceTokens: string[]
  ): Promise<FacePPAddFaceResponse> {
    return this.postForm("faceset/addface", (form) => {
      form.append("outer_id", outerId);
      form.append("face_tokens", faceTokens.join(","));
    });
  }

  searchByFaceToken(
    outerId: string,
    faceToken: string,
    returnCount = 5
  ): Promise<FacePPSearchResponse> {
    return this.postForm("search", (form) => {
      form.append("outer_id", outerId);
      form.append("face_token", faceToken);
      form.append("return_result_count", Math.max(1, Math.min(5, returnCount)).toString());
    });
  }
}
