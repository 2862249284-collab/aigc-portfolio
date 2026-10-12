// Backwards-compatible poster facade. The real implementation now lives in
// image-carousel.js and is shared by every image discipline (poster/banner/IP).
import { carouselMarkup, mountCarousel, carouselState } from './image-carousel.js';
import { findCategory } from '../data/categories.js';

const posterCategory = findCategory('poster');

// Kept as a live reference so external readers (tests, tools) can observe the
// carousel's remembered index for the poster gallery.
export const posterState = (carouselState.poster ??= { index: 0 });

export const posterMarkup = () => carouselMarkup(posterCategory);
export const mountPoster = root => mountCarousel(posterCategory, root);
