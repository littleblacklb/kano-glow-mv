#!/bin/zsh
# Generate 2 variants of each pose with gpt-image-2 through Codex's built-in image_gen.
# Usage: art/gen.sh rain play ...   (writes art/raw/<id>-v1.png, -v2.png)
cd "${0:A:h}/.."
for id in "$@"; do
  style=art/prompts/${id%%-*}.style.txt
  [[ -f $style ]] || style=art/prompts/style.txt
  {
    printf 'Use the $imagegen skill in its default built-in image_gen tool mode (not the CLI fallback). Generate exactly 2 separate variants (two separate image_gen calls) of the image specified below, using the attached cover.jpeg as the reference image described below. Then copy them from $CODEX_HOME/generated_images/... into this workspace as art/raw/%s-v1.png and art/raw/%s-v2.png. Do not edit any other files. Report the final paths.\n\n' "$id" "$id"
    cat "$style"
    echo
    cat "art/prompts/$id.txt"
  } | codex exec --skip-git-repo-check -C "$PWD" -c model_reasoning_effort='"low"' -i public/cover.jpeg - > "art/raw/$id.log" 2>&1 &
done
wait
