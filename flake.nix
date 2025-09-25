{
  description = "Indie Buddy Reddit Bot";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-25.05";

  outputs = { self, nixpkgs, ... }:
  let
    javaVersion = 21;

    supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
    forEachSupportedSystem =
      f: nixpkgs.lib.genAttrs supportedSystems (system:
        f {
          inherit system;
          pkgs = import nixpkgs {
            inherit system;
            overlays = [ self.overlays.default ];
          };
        });
  in
  {
    overlays.default = final: prev:
      let jdk = prev."jdk${toString javaVersion}";
      in {
        boot       = prev.boot.override { inherit jdk; };
        clojure    = prev.clojure.override { inherit jdk; };
        leiningen  = prev.leiningen.override { inherit jdk; };
      };

    packages = forEachSupportedSystem ({ pkgs, system }: {
      devvit = pkgs.writeShellApplication {
        name = "devvit";
        runtimeInputs = [ pkgs.nodejs_22 ];
        text = ''exec npm exec --yes devvit "$@"'';
      };
    });

    apps = forEachSupportedSystem ({ pkgs, system }: {
      devvit = {
        type = "app";
        program = "${self.packages.${system}.devvit}/bin/devvit";
      };
    });

    devShells = forEachSupportedSystem ({ pkgs, system }: {
      default = pkgs.mkShell {
        packages = with pkgs; [
          boot
          clojure
          leiningen
          bun
          node2nix
        ] ++ [ self.packages.${system}.devvit ];
      };
    });
  };
}
