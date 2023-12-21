import { Link } from "@remix-run/react";

interface RecipeCardProps {
  id: string;
  image: string;
  description: string;
  rating: number;
  submitter: string;
  tags: string[];
  title: string;
  options?: {
    maxDescriptionLength?: number;
  }
}

const getTruncatedDescription = ( description: string, maxDescriptionLength: number) => {
  if (!description) {
    return "No Description";
  }
  if (description.length > maxDescriptionLength) {
    return `${description?.substring(0, maxDescriptionLength)}...`;
  }

  return description;
};

const RecipeCard = ({
  id,
  image,
  description,
  rating,
  submitter,
  tags,
  title,
  options = {},
}: RecipeCardProps) => {
  const { maxDescriptionLength } = options;
  const finalDescription = maxDescriptionLength
    ? getTruncatedDescription(description, maxDescriptionLength)
    : description;

  return (
    <Link to={`/recipes/${id}`} className="no-underline">
      <div className="max-w-sm rounded overflow-hidden shadow-lg m-4 bg-white flex flex-col">
        <h2 className="text-xl font-bold p-4">{title}</h2>
        <img className="w-full" src={image} alt={title} />
        <p className="text-gray-700 text-base p-4">{finalDescription}</p>
        <div className="px-4 py-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="px-4 pb-4">
          <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
            Submitted by: {submitter}
          </span>
        </div>
        <div className="px-4 pb-4">
          <span className="text-gray-700 text-base p-4">Rating: {rating? rating : "Not yet rated!"}</span>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
