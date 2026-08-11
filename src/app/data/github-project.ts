export interface GithubProject {
  readonly name: string;
  readonly description: string | null;
  readonly url: string;
  readonly language: string | null;
  readonly updatedAt: string;
}
