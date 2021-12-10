export const linkify = (text: string): string => {
  let output = text;
  const regex = /\[[^\]]*\]/gm;
  const to_replace = text.match(regex);
  to_replace?.forEach((replacable) => {
    output = output.replace(
      replacable,
      `[${replacable.substring(1, replacable.length - 1)}](https://www.urbandictionary.com/define.php?term=${encodeURI(
        replacable.substring(1, replacable.length - 1)
      )})`
    );
  });
  return output;
};
