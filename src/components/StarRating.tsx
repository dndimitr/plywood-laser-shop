import { IconStar } from "@/components/Icons";

type Props = {
  rating: number;
  max?: number;
};

export function StarRating({ rating, max = 5 }: Props) {
  const value = Math.max(0, Math.min(max, Math.round(rating)));
  return (
    <span className="star-rating" aria-label={`Оценка ${value} от ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <IconStar key={i} size={16} filled={i < value} aria-hidden />
      ))}
    </span>
  );
}
